const router = require('express').Router();

// const { adminRegister, adminLogIn, deleteAdmin, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

const { adminRegister, adminLogIn, getAdminDetail, updateAdmin } = require('../controllers/admin-controller.js');

const { sclassCreate, sclassList, deleteSclass, deleteSclasses, getSclassDetail, getSclassStudents } = require('../controllers/class-controller.js');
const { complainCreate, complainList, deleteComplain } = require('../controllers/complain-controller.js');
const { noticeCreate, noticeList, deleteNotices, deleteNotice, updateNotice } = require('../controllers/notice-controller.js');
const {
    studentRegister,
    studentLogIn,
    getStudents,
    getStudentDetail,
    sclassStudents,
    deleteStudents,
    deleteStudent,
    updateStudent,
    studentAttendance,
    deleteStudentsByClass,
    updateExamResult,
    updateBulkMarks,
    updateBulkAttendance,
    clearAllStudentsAttendanceBySubject,
    clearAllStudentsAttendance,
    removeStudentAttendanceBySubject,
    collectFees,
    removeStudentAttendance,
    setClassFees,
    getNextGRNo } = require('../controllers/student_controller.js');
const { subjectCreate, classSubjects, deleteSubjectsByClass, getSubjectDetail, deleteSubject, freeSubjectList, allSubjects, deleteSubjects } = require('../controllers/subject-controller.js');
const { teacherRegister, teacherLogIn, getTeachers, getTeacherDetail, deleteTeachers, deleteTeachersByClass, deleteTeacher, updateTeacherSubject, teacherAttendance } = require('../controllers/teacher-controller.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { bulkStudentRegistration } = require('../controllers/student_controller.js');

// --- Super Admin & Demo Request Controllers ---
const { submitDemoRequest } = require('../controllers/demo-controller.js');
const {
    superAdminLogin,
    createSchool,
    getAllSchools,
    toggleSchoolStatus,
    updateSchoolPlan,
    updateSchoolInfo,
    getDemoRequests,
    updateDemoRequestStatus,
    getDashboardStats,
    razorpayWebhook,
} = require('../controllers/superadmin-controller.js');
const { verifyToken, requireRole } = require('../middleware/auth.js');

const { createOrder, verifyPayment } = require('../controllers/payment-controller');
const { syncSchoolToRazorpay, createFeeOrder } = require('../controllers/fee-controller');
const { FeeNotice } = require('../controllers/notice-controller.js')
const { documentUpload, documentList, documentDetail, documentDelete } = require('../controllers/document-controller.js');

// ============================================================
// PUBLIC ROUTES (no auth required)
// ============================================================

// Demo Request (public — replaces open registration)
router.post('/DemoRequest', submitDemoRequest);

// Razorpay Webhook (PUBLIC — no auth; security via signature verification)
router.post('/webhook/razorpay', razorpayWebhook);

// Admin (school admin login only — registration is disabled)
// router.post('/AdminReg', adminRegister); // DISABLED: Public registration removed
router.post('/AdminLogin', adminLogIn);

router.get("/Admin/:id", getAdminDetail)
// router.delete("/Admin/:id", deleteAdmin)

router.put("/Admin/:id", updateAdmin)

// Student

router.post('/StudentReg', studentRegister);
router.post('/StudentLogin', studentLogIn)

router.get("/Students/:id", getStudents)
router.get("/Student/:id", getStudentDetail)
router.get('/SclassStudents/:id', sclassStudents);
router.get('/NextGRNo/:id', getNextGRNo);

router.delete("/Students/:id", deleteStudents)
router.delete("/StudentsClass/:id", deleteStudentsByClass)
router.delete("/Student/:id", deleteStudent)

router.put("/Student/:id", updateStudent)

router.put('/UpdateExamResult/:id', updateExamResult)
router.put('/UpdateBulkMarks', updateBulkMarks);
router.put('/StudentAttendance/:id', studentAttendance)

router.put('/RemoveAllStudentsSubAtten/:id', clearAllStudentsAttendanceBySubject);
router.put('/RemoveAllStudentsAtten/:id', clearAllStudentsAttendance);

router.put('/RemoveStudentSubAtten/:id', removeStudentAttendanceBySubject);
router.put('/RemoveStudentAtten/:id', removeStudentAttendance)

// Teacher

router.post('/TeacherReg', teacherRegister);
router.post('/TeacherLogin', teacherLogIn)

router.get("/Teachers/:id", getTeachers)
router.get("/Teacher/:id", getTeacherDetail)

router.delete("/Teachers/:id", deleteTeachers)
router.delete("/TeachersClass/:id", deleteTeachersByClass)
router.delete("/Teacher/:id", deleteTeacher)

router.put("/TeacherSubject", updateTeacherSubject)

router.post('/TeacherAttendance/:id', teacherAttendance)
router.put('/UpdateBulkAttendance', updateBulkAttendance);
// Notice

router.post('/NoticeCreate', noticeCreate);

router.get('/NoticeList/:id', noticeList);

router.delete("/Notices/:id", deleteNotices)
router.delete("/Notice/:id", deleteNotice)

router.put("/Notice/:id", updateNotice)

// Complain

router.post('/ComplainCreate', complainCreate);
router.get('/ComplainList/:id', complainList);
router.delete('/Complain/:id', deleteComplain);


// Sclass

router.post('/SclassCreate', sclassCreate);

router.get('/SclassList/:id', sclassList);
router.get("/Sclass/:id", getSclassDetail)

router.get("/Sclass/Students/:id", getSclassStudents)

router.delete("/Sclasses/:id", deleteSclasses)
router.delete("/Sclass/:id", deleteSclass)

// Subject

router.post('/SubjectCreate', subjectCreate);

router.get('/AllSubjects/:id', allSubjects);
router.get('/ClassSubjects/:id', classSubjects);
router.get('/FreeSubjectList/:id', freeSubjectList);
router.get("/Subject/:id", getSubjectDetail)

router.delete("/Subject/:id", deleteSubject)
router.delete("/Subjects/:id", deleteSubjects)
router.delete("/SubjectsClass/:id", deleteSubjectsByClass)

// Bulk Student Registration
router.post('/BulkStudentReg', upload.single('excelFile'), bulkStudentRegistration);

// --- FINANCIAL LEDGER & FEE MANAGEMENT (disabled) ---
router.put('/CollectFees/:id', collectFees);
router.post('/FeeNotice', FeeNotice);

// --- ONLINE PAYMENT GATEWAY (RAZORPAY) (disabled) ---
router.post('/createOrder', createOrder);
router.post('/verifyPayment', verifyPayment);
router.post('/SetClassFees', setClassFees);

// --- RAZORPAY ROUTE: LINKED ACCOUNT & FEE SPLITTING ---
router.post('/SyncSchoolRazorpay/:adminId', syncSchoolToRazorpay);
router.post('/CreateFeeOrder', createFeeOrder);

// --- SCHOOL DOCUMENT VAULT ---
router.post('/DocumentUpload', documentUpload);
router.get('/DocumentList/:id', documentList);
router.get('/Document/:id', documentDetail);
router.delete('/Document/:id', documentDelete);

// ============================================================
// SUPER ADMIN ROUTES (JWT protected)
// ============================================================

router.post('/SuperAdminLogin', superAdminLogin);

// All Super Admin management routes require JWT + SuperAdmin role
router.get('/SuperAdmin/Dashboard', verifyToken, requireRole('SuperAdmin'), getDashboardStats);
router.get('/SuperAdmin/Schools', verifyToken, requireRole('SuperAdmin'), getAllSchools);
router.post('/SuperAdmin/CreateSchool', verifyToken, requireRole('SuperAdmin'), createSchool);
router.put('/SuperAdmin/School/:id/toggle', verifyToken, requireRole('SuperAdmin'), toggleSchoolStatus);
router.put('/SuperAdmin/School/:id/plan', verifyToken, requireRole('SuperAdmin'), updateSchoolPlan);
router.put('/SuperAdmin/School/:id', verifyToken, requireRole('SuperAdmin'), updateSchoolInfo);
router.get('/SuperAdmin/DemoRequests', verifyToken, requireRole('SuperAdmin'), getDemoRequests);
router.put('/SuperAdmin/DemoRequest/:id', verifyToken, requireRole('SuperAdmin'), updateDemoRequestStatus);

module.exports = router;