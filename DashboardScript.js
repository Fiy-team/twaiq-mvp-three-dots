import { getAllTransactions, getSuspiciousEntities, freezeAllTransactions, getAllProfiles, getProfile } from './mockDatabase.js';

// دالة مساعدة لجلب اسم الحساب
function getProfileName(profileId) {
    const profile = getProfile(profileId);
    return profile ? profile.name : 'غير محدد';
}

function render() {
    // 1. جلب البيانات والتأكد من أنها ليست فارغة
    const txs = getAllTransactions();
    const entities = getSuspiciousEntities();
    
    // 2. الإحصائيات (تحديث العدادات)
    const statsContainer = document.getElementById('stats-bar');
    const safeCount = txs.filter(t => t.riskLevel === 'آمن').length;
    // نحسب فقط العمليات المعلقة أو المجمدة
    const pendingTxs = txs.filter(t => t.status === 'PENDING_AI' || t.status === 'FROZEN');
    const medCount = pendingTxs.filter(t => t.riskLevel === 'متوسط').length;
    const highCount = pendingTxs.filter(t => t.riskLevel === 'عالي').length;
    
    // حساب السكور الأمني (مثال مبسط)
    const securityScore = Math.max(0, 100 - (highCount * 10 + medCount * 4));

    statsContainer.innerHTML = `
        <div class="card-shadow p-4 border-t-4 border-blue-500"><div class="text-gray-500 text-sm">العمليات الإجمالية</div><div class="text-2xl font-bold">${txs.length}</div></div>
        <div class="card-shadow p-4 border-t-4 border-green-500"><div class="text-gray-500 text-sm">آمنة</div><div class="text-2xl font-bold text-green-600">${safeCount}</div></div>
        <div class="card-shadow p-4 border-t-4 border-yellow-500"><div class="text-gray-500 text-sm">محتملة (تحقق)</div><div class="text-2xl font-bold text-yellow-600">${medCount}</div></div>
        <div class="card-shadow p-4 border-t-4 border-red-500"><div class="text-gray-500 text-sm">عالية الخطورة</div><div class="text-2xl font-bold text-red-600">${highCount}</div></div>
        <div class="card-shadow p-4 border-t-4 border-[#006C3A]"><div class="text-gray-500 text-sm">المؤشر الأمني</div><div class="text-2xl font-bold text-[#006C3A]">${securityScore}%</div></div>
    `;

    // 3. الجدول (عرض العمليات)
    const tableBody = document.getElementById('tx-table-body');
    tableBody.innerHTML = txs.map(tx => {
        let riskClass = tx.riskLevel === 'عالي' ? 'bg-red-100 text-red-700' : 
                        tx.riskLevel === 'متوسط' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
        
        let statusHTML = '';
        if (tx.status === 'PENDING_AI') {
            statusHTML = `<span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">${tx.aiAction}</span>`;
        } else if (tx.status === 'FROZEN') {
            statusHTML = `<span class="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded"><i class="fas fa-snowflake ml-1"></i>مجمدة</span>`;
        } else {
            let color = tx.status === 'APPROVED' ? 'text-green-600' : 'text-red-600';
            let icon = tx.status === 'APPROVED' ? 'fa-check-circle' : 'fa-times-circle';
            let statusText = tx.status === 'APPROVED' ? 'تم القبول' : (tx.status === 'REPORTED' ? 'تم الإبلاغ' : 'تم الرفض');
            statusHTML = `<span class="font-bold ${color}"><i class="fas ${icon} ml-1"></i>${statusText}</span>`;
        }

        return `
            <tr class="hover:bg-gray-50 border-b last:border-0 transition">
                <td class="p-3 font-bold text-gray-800">${tx.amount.toLocaleString()} SAR</td>
                <td class="p-3 text-sm">${tx.receiver}</td>
                <td class="p-3 text-xs text-gray-500">${tx.type}</td>
                <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${riskClass}">${tx.riskLevel}</span></td>
                <td class="p-3">${statusHTML}</td>
                <td class="p-3">
                    <a href="TransferDetails.html?id=${tx.id}" class="text-[#006C3A] hover:bg-green-50 px-2 py-1 rounded text-sm font-bold transition">
                        عرض <i class="fas fa-angle-left"></i>
                    </a>
                </td>
            </tr>
        `;
    }).join('');


    // 4. القائمة الجانبية للجهات المشبوهة
    const entitiesList = document.getElementById('entities-list');
    if (entities.length === 0) {
        entitiesList.innerHTML = `<div class="text-center text-xs text-gray-400">لا توجد جهات مشبوهة حالياً.</div>`;
    } else {
        entitiesList.innerHTML = entities.slice(0, 4).map(e => {
             let badgeColor = e.BLState === 'عالي الخطورة' ? 'text-red-600' : 
                              e.BLState === 'متوسط الخطورة' ? 'text-yellow-600' : 'text-green-600';
             return `
                 <div class="text-sm border-b pb-2 last:border-0">
                     <div class="font-bold text-gray-800 flex justify-between">
                         <span>${e.name}</span>
                         <span class="text-xs bg-gray-100 px-1 rounded text-gray-500">${e.totalScore} نقطة</span>
                     </div>
                     <div class="flex justify-between mt-1 items-center">
                         <span class="text-xs text-gray-400">${e.type}</span>
                         <span class="text-xs font-bold ${badgeColor}">${e.BLState}</span>
                     </div>
                 </div>
             `;
        }).join('');
    }

    // 5. منطق التحذير السريع (Pop-up Logic)
    // نبحث عن أول عملية عالية الخطورة ومعلقة
    const alertTx = pendingTxs.find(t => t.riskLevel === 'عالي');
    const alertBox = document.getElementById('ai-alert');
    const alertBtn = document.getElementById('alert-action-btn');

    if (alertTx) {
        alertBox.classList.remove('hidden');
        document.getElementById('ai-alert-text').innerHTML = `
            <span class="block font-bold text-gray-900 mb-1">اشتباه في: ${alertTx.receiver}</span>
            <span class="text-sm text-gray-600">لحساب: ${getProfileName(alertTx.profileId)}</span>
        `;
        // تفعيل زر "اتخذ الإجراء" في التنبيه
        alertBtn.onclick = () => {
            window.location.href = `TransferDetails.html?id=${alertTx.id}`;
        };
    } else {
        alertBox.classList.add('hidden');
    }
}

// 6. تفعيل زر التجميد المركزي
function setupGlobalActions() {
    const freezeBtn = document.getElementById('freeze-btn');
    freezeBtn.addEventListener('click', () => {
        if(confirm('هل أنت متأكد من تجميد جميع الحوالات المعلقة لحماية النظام؟ سيتم تجميد العمليات PENDING_AI.')) {
            const count = freezeAllTransactions();
            alert(`تم تجميد ${count} عملية بنجاح. النظام الآن في وضع الحماية.`);
            render(); // إعادة رسم الصفحة
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // هذه الخطوة تضمن تهيئة البيانات في حال كانت فارغة
    getAllTransactions(); 
    render();
    setupGlobalActions();
});
