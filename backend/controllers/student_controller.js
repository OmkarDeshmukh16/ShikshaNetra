const bcrypt = require('bcrypt');
const Student = require('../models/studentSchema.js');
const Subject = require('../models/subjectSchema.js');
const XLSX = require('xlsx');
const fs = require('fs');

const bulkStudentRegistration = async (req, res) => {
    try {
        const { school, sclassName } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No Excel file provided" });
        }
        if (!sclassName) {
            return res.status(400).json({ message: "Sclass ID is required but was not provided." });
        }
        
        let workbook;
        if (req.file.buffer) {
            workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        } else if (req.file.path) {
            workbook = XLSX.readFile(req.file.path);
        } else {
            return res.status(400).json({ message: "Could not read uploaded Excel file." });
        }

        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Mapping with exact matches to your Excel Template headers

        const saltRounds = 10;

        const students = await Promise.all(sheetData.map(async (row) => {
            const plainPassword = String(row["Password"] || "123456");
            // Hash the password manually before creating the object
            const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

            return {
                generalRegisterNo: row["generalRegisterNo"] || "",
                penNumber: row["penNumber"] || "",
                uid: row["uid"] || "",
                name: row["Name"],
                rollNum: row["Roll Number"],
                password: hashedPassword, // Store the HASH, not the text
                sclassName: sclassName,
                school: school,
                email: row["Email"] || "",
                gender: row["Gender"] || "",
                dob: row["Date of birth"] ? new Date(row["Date of birth"]) : null,
                birthDateInWords: row["birthDateInWords"] || "",
                nationality: row["Nationality"] || "Indian",
                motherName: row["Mother's Name"] || "",
                motherTongue: row["Mother Tongue"] || "",
                religion: row["Religion"] || "",
                caste: row["Caste"] || "",
                subCaste: row["Sub caste"] || "",
                birthPlace: row["Birth Place"] || "",
                previousSchoolName: row["Previous School Name"] || "",
                previousSchoolStandard: row["Previous School Standard"] || "",
                admissionDate: row["Admission Date"] ? new Date(row["Admission Date"]) : null,
                phone: row["Mob no."] ? String(row["Mob no."]) : "",
                address: row["Address"] || "",
                village: row["Village"] || "",
                taluka: row["Taluka"] || "",
                district: row["District"] || "",
                role: 'Student'
            };
        }));

        // Execute bulk insert with hashed passwords
        const result = await Student.insertMany(students);

        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(200).json({ message: `${result.length} Scholars registered with secure credentials.` });

    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Bulk Hashing Error:", error);
        res.status(500).json({ message: "Registry encryption failed", error: error.message });
    }
};

const studentRegister = async (req, res) => {
    try {
        const { 
            name, rollNum, password, sclassName, school, adminID,
            email, gender, dob, birthDateInWords, nationality, 
            motherTongue, religion, caste, subCaste, birthPlace, 
            phone, address, generalRegisterNo, penNumber, uid, 
            motherName, admissionDate, previousSchoolName, previousSchoolStandard, 
            dateOfLeaving, progress, conduct, reasonOfLeaving, remarks, village, taluka, district
        } = req.body;

        // Ensure we capture the school ID regardless of which key the frontend uses
        const finalSchoolID = school || adminID;

        // 1. Check for existing student in the same class and school
        const existingStudent = await Student.findOne({
            rollNum: rollNum,
            school: finalSchoolID,
            sclassName: sclassName,
        });

        if (existingStudent) {
            return res.send({ message: 'Roll Number already exists in this cohort' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // 3. Create student instance with all 15 institutional fields
        const student = new Student({
            name,
            rollNum,
            password: hashedPass,
            sclassName,
            school: finalSchoolID,
            generalRegisterNo, 
            penNumber,         
            uid,                
            motherName,         
            admissionDate,      
            previousSchoolName, 
            previousSchoolStandard, 
            village,            
            taluka,             
            district,
            email,
            gender,
            dob: dob ? new Date(dob) : null,
            birthDateInWords,
            nationality: nationality || "Indian",
            motherTongue,
            religion,
            caste,
            subCaste,
            birthPlace,
            phone,
            address,
            role: "Student",
            examResult: [],
            attendance: []
        });

        let result = await student.save();

        // 4. Return response without sensitive data
        result.password = undefined;
        res.status(200).send(result);

    } catch (err) {
        // Detailed logging to identify specific validation failures
        console.error("Institutional Registry Error:", err);
        res.status(500).json({ message: "Internal Registry Error", error: err.message });
    }
};

const studentLogIn = async (req, res) => {
    try {
        let student = await Student.findOne({ rollNum: req.body.rollNum, name: req.body.studentName });
        if (student) {
            const validated = await bcrypt.compare(req.body.password, student.password);
            if (validated) {
                student = await student.populate("school", "schoolName")
                student = await student.populate("sclassName", "sclassName")
                student.password = undefined;
                student.examResult = undefined;
                student.attendance = undefined;
                res.send(student);
            } else {
                res.send({ message: "Invalid password" });
            }
        } else {
            res.send({ message: "Student not found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudents = async (req, res) => {
    try {
        let students = await Student.find({ school: req.params.id }).populate("sclassName", "sclassName");
        if (students.length > 0) {
            let modifiedStudents = students.map((student) => {
                return { ...student._doc, password: undefined };
            });
            res.send(modifiedStudents);
        } else {
            res.send({ message: "No students found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getStudentsByClass = async (req, res) => {
    try {
        const { id } = req.params; // Class ID
        const students = await Student.find({ sclassName: id })
            .populate("sclassName", "sclassName")
            .select("-password"); // Exclude sensitive data

        if (students.length > 0) {
            res.status(200).json(students);
        } else {
            res.status(404).json({ message: "No scholars found in this cohort." });
        }
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
};

const getStudentDetail = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id)
            .populate("school", "schoolName")
            .populate("sclassName", "sclassName")
            .populate("examResult.subName")
            .populate("attendance.subName", "subName sessions");
        if (student) {
            student.password = undefined;
            res.send(student);
        }
        else {
            res.send({ message: "No student found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

const sclassStudents = async (req, res) => {
    try {
        const students = await Student.find({ sclassName: req.params.id });
        if (students.length > 0) {
            res.send(students);
        } else {
            res.send({ message: "No students found in this cohort" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteStudent = async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Scholar record not found in registry." });
        }
        res.status(200).json({ message: "Scholar record successfully purged from the registry." });
    } catch (err) {
        res.status(500).json({ message: "Registry error: Could not complete de-enrollment.", error: err });
    }
};

const deleteStudents = async (req, res) => {
    try {
        const result = await Student.deleteMany({ school: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const deleteStudentsByClass = async (req, res) => {
    try {
        const result = await Student.deleteMany({ sclassName: req.params.id })
        if (result.deletedCount === 0) {
            res.send({ message: "No students found to delete" })
        } else {
            res.send(result)
        }
    } catch (error) {
        res.status(500).json(err);
    }
}

const updateStudent = async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            res.body.password = await bcrypt.hash(res.body.password, salt)
        }
        let result = await Student.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true })

        result.password = undefined;
        res.send(result)
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateExamResult = async (req, res) => {
    const { subName, marksObtained } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const existingResult = student.examResult.find(
            (result) => result.subName.toString() === subName
        );

        if (existingResult) {
            existingResult.marksObtained = marksObtained;
        } else {
            student.examResult.push({ subName, marksObtained });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const studentAttendance = async (req, res) => {
    const { subName, status, date } = req.body;

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.send({ message: 'Student not found' });
        }

        const subject = await Subject.findById(subName);

        const existingAttendance = student.attendance.find(
            (a) =>
                a.date.toDateString() === new Date(date).toDateString() &&
                a.subName.toString() === subName
        );

        if (existingAttendance) {
            existingAttendance.status = status;
        } else {
            // Check if the student has already attended the maximum number of sessions
            const attendedSessions = student.attendance.filter(
                (a) => a.subName.toString() === subName
            ).length;

            if (attendedSessions >= subject.sessions) {
                return res.send({ message: 'Maximum attendance limit reached' });
            }

            student.attendance.push({ date, status, subName });
        }

        const result = await student.save();
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateBulkAttendance = async (req, res) => {
    try {
        const { attendanceData, date, subId } = req.body;

        const updatePromises = attendanceData.map(item => 
            Student.updateOne(
                { _id: item.studentId },
                { 
                    $push: { 
                        attendance: { 
                            date, 
                            status: item.status, 
                            subName: subId 
                        } 
                    } 
                }
            )
        );

        await Promise.all(updatePromises);
        res.status(200).json({ message: "Attendance registry synchronized." });
    } catch (err) {
        res.status(500).json(err);
    }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
    const subName = req.params.id;

    try {
        const result = await Student.updateMany(
            { 'attendance.subName': subName },
            { $pull: { attendance: { subName } } }
        );
        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const clearAllStudentsAttendance = async (req, res) => {
    const schoolId = req.params.id

    try {
        const result = await Student.updateMany(
            { school: schoolId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const removeStudentAttendanceBySubject = async (req, res) => {
    const studentId = req.params.id;
    const subName = req.body.subId

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $pull: { attendance: { subName: subName } } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


const removeStudentAttendance = async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await Student.updateOne(
            { _id: studentId },
            { $set: { attendance: [] } }
        );

        return res.send(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

const collectFees = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) return res.status(404).json({ message: "Scholar not found" });

        // Ensure fees object is initialized
        if (!student.fees || student.fees.totalAmount === 0) {
            return res.status(400).json({ message: "Fees have not been set for this student yet." });
        }

        const installment = Number(amount);

        // Safety Check: Don't allow overpayment
        if (installment > student.fees.balanceAmount) {
            return res.status(400).json({ 
                message: `Invalid Amount. Maximum payable is ₹${student.fees.balanceAmount}` 
            });
        }

        student.fees.paidAmount += installment;
        student.fees.balanceAmount = student.fees.totalAmount - student.fees.paidAmount;
        
        // Update Status automatically
        if (student.fees.balanceAmount === 0) {
            student.fees.paymentStatus = 'Paid';
        } else {
            student.fees.paymentStatus = 'Partial';
        }

        // Transaction History
        student.fees.transactions.push({
            amount: installment,
            paymentMethod: paymentMethod + " (Offline)",
            receiptNo: `OFF-${Date.now()}`,
            date: new Date()
        });

        await student.save();
        res.status(200).json({ message: "Transaction recorded in ledger" });
    } catch (err) {
        console.error("CollectFees Error:", err);
        res.status(500).json({ message: "Fee collection failed", error: err.message });
    }
};

const setClassFees = async (req, res) => {
    try {
        const { sclassName, totalAmount, school } = req.body;

        // Update all students in the selected class who belong to this school
        const result = await Student.updateMany(
            { sclassName: sclassName, school: school },
            { 
                $set: { 
                    "fees.totalAmount": Number(totalAmount),
                    "fees.balanceAmount": Number(totalAmount) // Initially balance = total
                } 
            }
        );

        if (result.nModified === 0) {
            return res.status(404).json({ message: "No students found in this cohort." });
        }

        res.status(200).json({ message: `Fees updated for ${result.modifiedCount} scholars.` });
    } catch (err) {
        res.status(500).json({ message: "Error updating class fees", error: err });
    }
};

const updateBulkMarks = async (req, res) => {
    try {
        const { marksData } = req.body;

        if (!marksData || !Array.isArray(marksData)) {
            return res.status(400).json({ message: "Invalid marks payload." });
        }

        const updatePromises = marksData.map(async (item) => {
            const numericMarks = Number(item.marksObtained);

            // 1. Try to update existing subject entry inside student's examResult array
            const result = await Student.updateOne(
                { _id: item.studentID, "examResult.subName": item.subID },
                { $set: { "examResult.$.marksObtained": numericMarks } }
            );

            // 2. If subject entry doesn't exist in examResult yet (matchedCount === 0), push a new subject mark entry
            if (result.matchedCount === 0) {
                await Student.updateOne(
                    { _id: item.studentID },
                    { $push: { examResult: { subName: item.subID, marksObtained: numericMarks } } }
                );
            }
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: "Academic records updated successfully." });
    } catch (err) {
        console.error("Error updating bulk marks:", err);
        res.status(500).json({ message: "Failed to update academic records", error: err });
    }
};

const getNextGRNo = async (req, res) => {
    try {
        const schoolId = req.params.id;

        // Find all students for this school, pick the one with the highest numeric GR number
        const students = await Student.find({ school: schoolId })
            .select('generalRegisterNo')
            .lean();

        if (!students || students.length === 0) {
            // No students yet — let admin enter the first GR number manually
            return res.status(200).json({ nextGRNo: '' });
        }

        // Extract numeric values from GR numbers and find the maximum
        let maxNum = 0;
        let maxLen = 1; // track the padding length of the highest GR number

        students.forEach(s => {
            if (s.generalRegisterNo) {
                const num = parseInt(s.generalRegisterNo, 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                    maxLen = s.generalRegisterNo.length;
                }
            }
        });

        if (maxNum === 0) {
            // Students exist but none have a valid numeric GR number
            return res.status(200).json({ nextGRNo: '' });
        }

        // Increment and pad to the same length (e.g., "001" → "002")
        const nextNum = maxNum + 1;
        const nextGRNo = String(nextNum).padStart(maxLen, '0');

        res.status(200).json({ nextGRNo });
    } catch (err) {
        console.error("GetNextGRNo Error:", err);
        res.status(500).json({ message: "Error fetching next GR number", error: err.message });
    }
};

module.exports = {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    sclassStudents,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    updateBulkAttendance,
    deleteStudentsByClass,
    updateExamResult,
    bulkStudentRegistration,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    removeStudentAttendance,
    getStudentsByClass,
    collectFees,
    setClassFees,
    updateBulkMarks,
    getNextGRNo
};