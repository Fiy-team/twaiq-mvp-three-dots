// C:\TWAIQ-1-MVP\mockDatabase.js

// ==========================================
// 1. نظام إدارة البيانات (Storage Manager)
// ==========================================
const DB_KEY_TX = 'absher_transactions_v1';
const DB_KEY_PROFILES = 'absher_profiles'; 

// البيانات الأولية للبروفايلات
const initialProfilesData = [
    { profileId: 'UID-1001', name: 'أحمد صالح العلي', nameEn: 'Ahmed AlAli', nationalId: '1074xxxxx', avgMonthlyTransfer: 8000, profileStatus: 'نشط', lastLoginDevice: 'iPhone 15' },
    { profileId: 'UID-1002', name: 'سارة خالد الدوسري', nameEn: 'Sara AlDosari', nationalId: '1075xxxxx', avgMonthlyTransfer: 5000, profileStatus: 'نشط', lastLoginDevice: 'MacBook Pro' },
    { profileId: 'UID-1003', name: 'فيصل محمد القرني', nameEn: 'Faisal AlQarni', nationalId: '1076xxxxx', avgMonthlyTransfer: 1500, profileStatus: 'نشط', lastLoginDevice: 'Samsung S24' },
    { profileId: 'UID-1004', name: 'نورة فهد العمري', nameEn: 'Noura AlAmri', nationalId: '1077xxxxx', avgMonthlyTransfer: 4500, profileStatus: 'نشط', lastLoginDevice: 'Desktop PC' },
    { profileId: 'UID-1005', name: 'يوسف بدر الحربي', nameEn: 'Yousef AlHarbi', nationalId: '1078xxxxx', avgMonthlyTransfer: 9000, profileStatus: 'نشط', lastLoginDevice: 'iPhone 14 Pro' }
];

// البيانات الأولية للعمليات
const initialTransactionsData = [
    { id: 'T-5501', profileId: 'UID-1001', amount: 35000, receiver: 'Crypto Wallet X', time: '2025-11-30 02:00:00', type: 'محفظة رقمية', reportsData: [{id: 'R01', count: 1}, {id: 'R02', count: 1}], reportsCount: 2, status: 'PENDING_AI', riskScore: 92, riskLevel: 'عالي جداً', shortReason: {ar: 'خطورة عالية جداً: المستفيد لديه 2 بلاغاً سابقاً، منها 2 عالي الخطورة. (طبيعة التحويل دولية/رقمية عالية الخطورة). (العملية تمت في وقت متأخر/مبكر جداً).', en: 'Extremely High Risk: Receiver has 2 prior reports, including 2 high risk ones. (High-risk international/crypto transfer). (Transaction occurred at a very late/early hour).'}, aiAction: 'إيقاف مؤقت وتقرير إلزامي' },
    { id: 'T-5502', profileId: 'UID-1002', amount: 12000, receiver: 'Tech Store Corp', time: '2025-11-30 13:30:00', type: 'حساب تجاري', reportsData: [{id: 'R05', count: 2}], reportsCount: 2, status: 'PENDING_AI', riskScore: 68, riskLevel: 'متوسط', shortReason: {ar: 'خطورة مرتفعة: المستفيد لديه 2 بلاغاً سابقاً. مبلغ يتجاوز الحد المعتاد بشكل كبير.', en: 'High Risk: Receiver has 2 prior reports. Exceeds usual spending limit, requires verification.'}, aiAction: 'تحقق إضافي' },
    { id: 'T-5503', profileId: 'UID-1003', amount: 500, receiver: 'Saudi Electricity', time: '2025-11-30 10:00:00', type: 'سداد فواتير', reportsData: [], reportsCount: 0, status: 'APPROVED', riskScore: 5, riskLevel: 'آمن', shortReason: {ar: 'عملية عادية، تم قبولها تلقائياً.', en: 'Standard transaction, auto-approved.'}, aiAction: 'قبول' },
    { id: 'T-5504', profileId: 'UID-1004', amount: 18000, receiver: 'Forex Trading Global', time: '2025-11-29 23:45:00', type: 'تحويل دولي', reportsData: [{id: 'R02', count: 3}], reportsCount: 3, status: 'PENDING_AI', riskScore: 88, riskLevel: 'عالي', shortReason: {ar: 'خطورة عالية جداً: المستفيد لديه 3 بلاغاً سابقاً، منها 3 عالي الخطورة. (طبيعة التحويل دولية/رقمية عالية الخطورة).', en: 'Extremely High Risk: Receiver has 3 prior reports, including 3 high risk ones. (High-risk international/crypto transfer).'}, aiAction: 'إيقاف مؤقت' },
    { id: 'T-5505', profileId: 'UID-1001', amount: 950, receiver: 'Mobily Bill', time: '2025-11-28 15:10:00', type: 'سداد فواتير', reportsData: [], reportsCount: 0, status: 'APPROVED', riskScore: 10, riskLevel: 'آمن', shortReason: {ar: 'عملية عادية، تم قبولها تلقائياً.', en: 'Standard transaction, auto-approved.'}, aiAction: 'قبول' },
    { id: 'T-5506', profileId: 'UID-1005', amount: 4000, receiver: 'Fashion Store XYZ', time: '2025-11-27 18:00:00', type: 'حساب تجاري', reportsData: [{id: 'R06', count: 1}], reportsCount: 1, status: 'REJECTED', riskScore: 45, riskLevel: 'متوسط', shortReason: {ar: 'شراء ضخم من متجر جديد، تم رفضه يدوياً.', en: 'Large purchase from a new store, manually rejected.'}, aiAction: 'رفض' },
];


// تهيئة البيانات: (للتأكد من وجود جميع المفاتيح)
function initStorage() {
    if (!localStorage.getItem(DB_KEY_TX)) {
        localStorage.setItem(DB_KEY_TX, JSON.stringify(initialTransactionsData));
    }
    if (!localStorage.getItem(DB_KEY_PROFILES)) {
        localStorage.setItem(DB_KEY_PROFILES, JSON.stringify(initialProfilesData));
    }
}

// دالة جلب آمنة تتعامل مع التلف في الذاكرة المحلية (تضمن جلب البيانات)
function safeGetItem(key) {
    initStorage();
    const data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error(`Error parsing data for key ${key}, resetting it.`, e);
        // في حال فشل القراءة، يتم حذف المفتاح وإعادة تهيئة القيمة الافتراضية
        localStorage.removeItem(key);
        initStorage(); 
        return JSON.parse(localStorage.getItem(key));
    }
}

// الدوال الأساسية للجلب والحفظ (مصدرة)
export function getAllTransactions() {
    return safeGetItem(DB_KEY_TX);
}

export function getAllProfiles() {
    return safeGetItem(DB_KEY_PROFILES);
}

export function getProfile(id) {
    const profiles = getAllProfiles();
    return profiles.find(p => p.profileId === id);
}

// دالة إضافة بروفايل جديد (تم إصلاحها لحل المشكلة الثانية)
export function addProfile(profileId, name) {
    const profiles = getAllProfiles(); 
    
    if (profiles.find(p => p.profileId === profileId)) {
        return false;
    }
    const newProfile = { 
        profileId, 
        name, 
        nameEn: 'New User', 
        nationalId: '0000xxxxx', 
        avgMonthlyTransfer: 100,
        profileStatus: 'جديد', 
        lastLoginDevice: 'Web Simulator' 
    };
    
    profiles.push(newProfile);
    
    // الحل: حفظ المصفوفة المحدثة إلى Local Storage
    localStorage.setItem(DB_KEY_PROFILES, JSON.stringify(profiles));
    return true;
}

// الدوال الأخرى (مصدرة)
export function getTransactionById(id) {
    const txs = getAllTransactions();
    return txs.find(t => t.id === id);
}
export function getProfileTransactions(profileId) {
    const txs = getAllTransactions();
    return txs.filter(t => t.profileId === profileId);
}
export function updateTransactionStatus(id, newStatus, actionType) {
    const txs = getAllTransactions();
    const index = txs.findIndex(t => t.id === id);
    if (index !== -1) {
        txs[index].status = newStatus;
        txs[index].actionTaken = actionType;
        txs[index].resolutionDate = new Date().toLocaleString('ar-SA');
        localStorage.setItem(DB_KEY_TX, JSON.stringify(txs)); 
        return true;
    }
    return false;
}
export function freezeAllTransactions() {
    const txs = getAllTransactions();
    let count = 0;
    txs.forEach(t => {
        if (t.status === 'PENDING_AI') {
            t.status = 'FROZEN';
            t.aiAction = 'مُجمدة';
            count++;
        }
    });
    localStorage.setItem(DB_KEY_TX, JSON.stringify(txs));
    return count;
}


// ==========================================
// 2. الثوابت والتعريفات (Report Types) 
// ==========================================

export const ReportTypes = [
    { id: 'R01', label: 'غسيل أموال (AML)', score: 18, level: 'عالي' },
    { id: 'R02', label: 'احتيال مالي منظم', score: 15, level: 'عالي' },
    { id: 'R03', label: 'تجميد أصول قضائي', score: 12, level: 'عالي' },
    { id: 'R04', label: 'نزاع تجاري متكرر', score: 8, level: 'متوسط' },
    { id: 'R05', label: 'تحويلات مبالغ متكررة', score: 6, level: 'متوسط' },
    { id: 'R06', label: 'عدم اكتمال خدمة/منتج', score: 4, level: 'متوسط' },
    { id: 'R07', label: 'تواصل غير مرغوب (Spam)', score: 2, level: 'خفيف' },
    { id: 'R08', label: 'محاولة انتحال فاشلة', score: 1, level: 'خفيف' },
    { id: 'R09', label: 'إعلانات مضللة', score: 1, level: 'خفيف' },
];

function getReportTypeById(id) {
    return ReportTypes.find(r => r.id === id);
}


// ==========================================
// 3. منطق حساب الخطورة وإضافة التحويل
// ==========================================

function generateAIAnalysis(amount, type, reportsString, time) {
    // منطق التحليل كما هو (لا يحتاج تعديل)
    let riskScore = 0; 
    let riskLevel = 'آمن';
    let shortReason = { ar: 'عملية عادية، مطابقة لسلوك المستخدم.', en: 'Standard transaction, matches user behavior.' };
    let aiAction = 'قبول';
    let totalReportsCount = 0;

    const selectedReports = JSON.parse(reportsString);
    let reportsRiskScore = 0;
    
    selectedReports.forEach(r => {
        const reportType = getReportTypeById(r.id);
        if (reportType && r.count > 0) {
            reportsRiskScore += reportType.score * r.count;
            totalReportsCount += r.count;
        }
    });

    if (totalReportsCount > 0) {
        riskScore += reportsRiskScore; 
        const highRiskReportsCount = selectedReports.filter(r => getReportTypeById(r.id)?.level === 'عالي' && r.count > 0).reduce((sum, r) => sum + r.count, 0);
        
        if (highRiskReportsCount > 0) {
            riskScore += 50; 
            shortReason.ar = `خطورة عالية جداً: المستفيد لديه ${totalReportsCount} بلاغاً سابقاً، منها ${highRiskReportsCount} عالي الخطورة.`;
            shortReason.en = `Extremely High Risk: Receiver has ${totalReportsCount} prior reports, including ${highRiskReportsCount} high risk ones.`;
        } else if (reportsRiskScore > 20) {
            shortReason.ar = `خطورة مرتفعة: المستفيد لديه ${totalReportsCount} بلاغاً سابقاً.`;
            shortReason.en = `High Risk: Receiver has ${totalReportsCount} prior reports.`;
        }
    }
    
    if (amount >= 1000000) { riskScore += 90; if (riskScore < 100) { shortReason.ar = 'مبلغ ضخم جداً وغير مبرر يتجاوز المليون.'; } } 
    else if (amount > 20000) { riskScore += 25; if (!shortReason.ar.includes('خطورة')) { shortReason.ar = 'مبلغ يتجاوز الحد المعتاد بشكل كبير.'; } } 
    else if (amount > 10000) { riskScore += 10; }

    if (type === 'محفظة رقمية' || type === 'تحويل دولي') {
        riskScore += 15;
        if (!shortReason.ar.includes('خطورة') && !shortReason.ar.includes('مبلغ') && !shortReason.ar.includes('عملية عادية')) { shortReason.ar = 'طبيعة التحويل دولية/رقمية عالية الخطورة.'; } 
        else if (shortReason.ar !== 'عملية عادية، مطابقة لسلوك المستخدم.') { shortReason.ar += ' (طبيعة التحويل دولية/رقمية عالية الخطورة).'; }
    }

    const hour = parseInt(time.split(':')[0]); 
    if (hour >= 0 && hour <= 6) { 
        riskScore += 10;
        if (!shortReason.ar.includes('خطورة') && !shortReason.ar.includes('مبلغ') && !shortReason.ar.includes('عملية عادية')) { shortReason.ar = 'العملية تمت في وقت متأخر/مبكر جداً.'; } 
        else if (shortReason.ar !== 'عملية عادية، مطابقة لسلوك المستخدم.') { shortReason.ar += ` (العملية تمت في وقت متأخر/مبكر جداً).`; }
    }

    riskScore = Math.min(riskScore, 100); 

    if (riskScore >= 90) { riskLevel = 'عالي جداً'; aiAction = 'إيقاف مؤقت وتقرير إلزامي'; } 
    else if (riskScore >= 75) { riskLevel = 'عالي'; aiAction = 'إيقاف مؤقت'; } 
    else if (riskScore >= 40) { riskLevel = 'متوسط'; aiAction = 'تحقق إضافي'; } 
    else { riskLevel = 'آمن'; aiAction = 'قبول'; riskScore = Math.min(riskScore, 20); }

    const analysisResult = {
        status: riskLevel !== 'آمن' ? 'PENDING_AI' : 'APPROVED',
        riskScore,
        riskLevel,
        shortReason,
        aiAction,
        reportsData: selectedReports,
        totalReportsCount: totalReportsCount
    };

    if (riskLevel === 'آمن') { analysisResult.shortReason = { ar: 'عملية عادية، تم قبولها تلقائياً.', en: 'Standard transaction, auto-approved.' }; }
    
    return analysisResult;
}

export function addTransaction(data) {
    const txs = getAllTransactions();

    const lastId = txs.length > 0 ? txs[txs.length - 1].id : 'T-5500';
    const newTxNum = parseInt(lastId.substring(2)) + 1;
    const newId = `T-${newTxNum}`;
    const analysis = generateAIAnalysis(data.amount, data.type, data.reportsDataString, data.time);

    const newTransaction = {
        id: newId, profileId: data.profileId, amount: parseFloat(data.amount), receiver: data.receiver,
        time: `${data.date} ${data.time}:00`, type: data.type,
        reportsData: analysis.reportsData || [], reportsCount: analysis.totalReportsCount || 0,
        ...analysis 
    };

    txs.push(newTransaction);
    localStorage.setItem(DB_KEY_TX, JSON.stringify(txs));
    return newTransaction;
}
