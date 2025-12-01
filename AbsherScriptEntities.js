// AbsherScriptEntities.js

import { getSuspiciousEntities } from './mockDatabase.js';

function renderEntitiesTable() {
    // نستخدم ID: entities-body الموجود في HTML
    const targetBody = document.getElementById('entities-body');
    if (!targetBody) return; 

    const entities = getSuspiciousEntities();
    targetBody.innerHTML = '';
    
    entities.forEach(entity => {
        
        // 1. تلوين الحالة (BLState)
        let colorClass = '';
        if (entity.BLState === 'عالي الخطورة') colorClass = 'bg-red-100 text-red-800 border-red-200';
        else if (entity.BLState === 'متوسط الخطورة') colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        else colorClass = 'bg-green-100 text-green-800 border-green-200';

        // 2. شارة "التعامل لأول مرة"
        const firstTimeBadge = entity.meta.first ? 
            `<span class="flex items-center text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100 mb-1 w-fit"><i class="fas fa-user-plus ml-1"></i>لأول مرة</span>` : 
            `<span class="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 mb-1 w-fit"><i class="fas fa-history ml-1"></i>عميل سابق</span>`;

        // 3. شارة "وقت التنفيذ"
        const isLate = entity.factors.some(f => f.includes('توقيت مشبوه'));
        const timeBadge = isLate ? 
            `<span class="flex items-center text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 mb-1 w-fit"><i class="fas fa-moon ml-1"></i>${entity.meta.time}</span>` :
            `<span class="flex items-center text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 mb-1 w-fit"><i class="fas fa-sun ml-1"></i>${entity.meta.time}</span>`;

        // 4. شارة "نوع الجهة"
        const typeBadge = `<span class="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 w-fit"><i class="fas fa-building ml-1"></i>${entity.type}</span>`;
        
        // 5. بناء سطر الجدول
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition border-b last:border-0';
        
        row.innerHTML = `
            <td class="p-4 align-top">
                <div class="font-bold text-gray-900 text-lg">${entity.name}</div>
                <div class="text-xs text-gray-500 mt-1">عدد البلاغات: ${entity.reportCount}</div>
            </td>
            
            <td class="p-4 align-top font-bold text-xl text-center text-gray-700">
                ${entity.totalScore}
            </td>
            
            <td class="p-4 align-top">
                <span class="px-3 py-1 rounded-full text-xs font-bold border ${colorClass}">
                    ${entity.BLState}
                </span>
            </td>
            
            <td class="p-4 align-top">
                <div class="flex flex-col gap-1">
                    ${firstTimeBadge}
                    ${timeBadge}
                    ${typeBadge}
                </div>
            </td>
        `;
        targetBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', renderEntitiesTable);
