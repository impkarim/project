// script.js (الكود الكامل، تم استبدال LocalStorage بـ Firebase Firestore)

let casesData = [];
// لم نعد نحتاج nextId رقمي، سنعتمد على معرّف Firestore (doc.id) النصي
// let nextId = 1; 

let isArchivePage = false; 
let isFeaturedPage = false;

// عناصر الواجهة
const casesTbody = document.getElementById('casesTbody'); 
const caseModal = document.getElementById('caseModal');
const caseForm = document.getElementById('caseForm');
const caseDetailsPopover = document.getElementById('caseDetailsPopover');
const themeToggle = document.getElementById('themeToggle'); 
const body = document.body;
const noCasesMessage = document.getElementById('noCasesMessage'); 


// ----------------------------------------------------
// 1. تهيئة Firebase و Firestore (يجب تعديل هذا الجزء)
// ----------------------------------------------------

// 📌📌📌 الخطوة الأهم: استبدل هذه القيم ببيانات مشروعك الخاصة من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAkKrW8In4MKu_IfJYGhXrsCebS9ETPq88",
  authDomain: "imp-bot-9ccaf.firebaseapp.com",
  projectId: "imp-bot-9ccaf",
  storageBucket: "imp-bot-9ccaf.firebasestorage.app",
  messagingSenderId: "532327321288",
  appId: "1:532327321288:web:313d6f2a42f94b7aca1ffd",
  measurementId: "G-4WZGZBY46V"
};

// تهيئة تطبيق Firebase
const app = firebase.initializeApp(firebaseConfig);

// الحصول على مرجع Firestore (قاعدة البيانات)
const db = firebase.firestore();

// اسم مجموعة البيانات (Collection)
const casesCollection = db.collection("cases"); 


// ----------------------------------------------------
// 2. دوال إدارة الوضع (Dark/Light Mode) والتحميل/الحفظ (Firestore)
// ----------------------------------------------------

function setDarkTheme(isDark) {
    if (isDark) {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; 
    } else {
        body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; 
    }
    // لا يزال الثيم محفوظاً محلياً
    localStorage.setItem('theme', isDark ? 'dark' : 'light'); 
}

themeToggle.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    setDarkTheme(!isDark);
});


async function loadCasesData() {
    try {
        console.log("جارٍ جلب البيانات من Firebase Firestore...");
        
        // جلب جميع المستندات من مجموعة 'cases'
        const snapshot = await casesCollection.get();
        
        // تحويل المستندات إلى مصفوفة JavaScript
        casesData = snapshot.docs.map(doc => ({
            id: doc.id, // استخدام معرّف Firestore كنص (string ID)
            ...doc.data()
        }));
        
    } catch (error) {
        console.error("خطأ في جلب البيانات من Firebase:", error);
        alert("فشل تحميل البيانات من السحابة. تأكد من إعدادات Firebase والقواعد الأمنية.");
        casesData = [];
    }
}

// *** ملاحظة: لم نعد نحتاج دالة saveCasesData منفصلة، لأن الحفظ يتم مباشرة 
// عند الإضافة أو التعديل أو الحذف باستخدام وظائف Firestore (add, set, delete) ***


// ----------------------------------------------------
// دوال التاريخ والأذكار (بدون تغيير)
// ----------------------------------------------------

const tasbeehArray = [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "اللهم صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّد",
    "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
    "اللَّهُ أَكْبَرُ",
    "الحَمْدُ للهِ",
    "سُبْحَانَ اللَّهِ"
];
let currentTasbeehIndex = 0;

function updateDateAndTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('ar-EG', dateOptions);

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString('fr-FR', timeOptions);

    const dateDisplayElement = document.getElementById('currentDateDisplay');
    if (dateDisplayElement) {
        dateDisplayElement.textContent = `${formattedDate} | ${formattedTime}`;
    }
}

function updateTasbeeh() {
    const tasbeehDisplayElement = document.getElementById('tasbeehDisplay');
    if (tasbeehDisplayElement) {
        tasbeehDisplayElement.textContent = tasbeehArray[currentTasbeehIndex];
        currentTasbeehIndex = (currentTasbeehIndex + 1) % tasbeehArray.length;
    }
}


// ----------------------------------------------------
// دوال الواجهة (UI) - بدون تغيير جوهري
// ----------------------------------------------------

function getStatusText(status) {
    switch (status) {
        case 'active': return 'قيد التنفيذ';
        case 'pending': return 'مؤجلة/انتظار';
        case 'closed': return 'منتهية';
        default: return 'غير معروف';
    }
}

function getPaymentStatusText(status) {
    switch (status) {
        case 'fully_paid': return 'سُددت بالكامل';
        case 'partially_paid': return 'سُدد جزء منها';
        case 'not_paid': return 'لم تُسدد بعد';
        case 'not_applicable': return 'غير مطبقة';
        default: return 'غير محدد';
    }
}

function printReport() {
    window.print();
}

function closeModal() {
    caseModal.style.display = 'none';
}

function closePopover() {
    caseDetailsPopover.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == caseModal) {
        closeModal();
    }
    if (event.target == caseDetailsPopover) {
        closePopover();
    }
}

function renderCases(cases) {
    if (!casesTbody) return; 

    casesTbody.innerHTML = ''; 
    let filteredCases = [];

    // منطق التصفية ليتناسب مع الصفحات الثلاث
    if (isArchivePage) {
        filteredCases = cases.filter(c => c.status === 'closed');
        filteredCases.sort((a, b) => new Date(b.nextDate) - new Date(a.nextDate)); 
    } else if (isFeaturedPage) {
        filteredCases = cases.filter(c => c.isFeatured && c.status !== 'closed');
        filteredCases.sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate)); 
    } else {
        filteredCases = cases.filter(c => c.status !== 'closed');
        filteredCases.sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate)); 
    }

    // عرض رسالة "لا توجد قضايا"
    if (filteredCases.length === 0) {
        if (noCasesMessage) noCasesMessage.style.display = 'block';
        return;
    } else {
         if (noCasesMessage) noCasesMessage.style.display = 'none';
    }
    
    filteredCases.forEach(caseItem => {
        // لاحظ أن caseItem.id هو الآن string ID من Firestore
        const row = casesTbody.insertRow();
        const statusClass = `status-${caseItem.status}`;
        
        row.onclick = () => showCaseDetails(caseItem.id); 

        const dateDisplay = caseItem.nextDate; 
        const featuredIcon = caseItem.isFeatured ? '⭐ ' : ''; 

        row.innerHTML = `
            <td>${caseItem.number}</td>
            <td>${featuredIcon}${caseItem.client}</td>
            <td>${caseItem.subject}</td>
            <td>${dateDisplay}</td>
            <td class="status-cell"><span class="${statusClass}">${getStatusText(caseItem.status)}</span></td>
            <td>
                <button onclick="event.stopPropagation(); editCase('${caseItem.id}');" class="action-btn-table edit-btn">تعديل</button>
                <button onclick="event.stopPropagation(); deleteCase('${caseItem.id}');" class="action-btn-table delete-btn">حذف</button>
            </td>
        `;
    });
}


function showCaseDetails(id) {
    const caseItem = casesData.find(c => c.id === id);
    if (!caseItem) return;
    
    const status = caseItem.status;
    const paymentStatus = caseItem.paymentStatus || 'not_paid';

    const statusClass = `status-popover-${status}`;
    const statusHtml = `<span class="popover-detail-status ${statusClass}">${getStatusText(status)}</span>`;

    const paymentClass = `payment-popover-${paymentStatus}`;
    const paymentHtml = `<span class="popover-detail-status ${paymentClass}">${getPaymentStatusText(paymentStatus)}</span>`;


    document.getElementById('popoverTitle').textContent = `تفاصيل القضية: ${caseItem.client}`;
    document.getElementById('popoverNumber').textContent = caseItem.number;
    document.getElementById('popoverSubject').textContent = caseItem.subject;
    document.getElementById('popoverNextDate').textContent = caseItem.nextDate;
    
    document.getElementById('popoverStatus').innerHTML = statusHtml;
    document.getElementById('popoverPaymentStatus').innerHTML = paymentHtml;


    document.getElementById('popoverNotes').textContent = caseItem.notes || 'لا توجد ملاحظات مفصلة.';
    
    const editBtn = document.getElementById('popoverEditButton');
    editBtn.onclick = () => {
        closePopover();
        editCase(caseItem.id);
    };

    caseDetailsPopover.style.display = 'block'; 
}


function searchCases() {
    closePopover();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // البحث يكون في الذاكرة (casesData) وليس في Firestore مباشرة
    const allFiltered = casesData.filter(caseItem => {
        return caseItem.number.toLowerCase().includes(searchTerm) || 
               caseItem.client.toLowerCase().includes(searchTerm) ||
               caseItem.subject.toLowerCase().includes(searchTerm);
    });

    renderCases(allFiltered); 
}

// ----------------------------------------------------
// وظائف الإدارة (CRUD) - تم التعديل على الإضافة/التعديل/الحذف
// ----------------------------------------------------

function addNewCase() {
    closePopover(); 
    document.getElementById('modalTitle').textContent = 'إضافة قضية جديدة';
    caseForm.reset(); 
    document.getElementById('caseId').value = ''; // ID فارغ للإضافة
    document.getElementById('saveButton').textContent = 'حفظ';
    
    document.getElementById('paymentStatus').value = 'not_paid';
    document.getElementById('isFeatured').checked = false; 

    caseModal.style.display = 'block'; 
}

function editCase(id) {
    closePopover(); 
    const caseToEdit = casesData.find(c => c.id === id);
    if (!caseToEdit) return;

    document.getElementById('modalTitle').textContent = `تعديل القضية رقم: ${caseToEdit.number}`;
    document.getElementById('caseId').value = caseToEdit.id; // تمرير ID Firestore (string)
    document.getElementById('number').value = caseToEdit.number;
    document.getElementById('client').value = caseToEdit.client;
    document.getElementById('subject').value = caseToEdit.subject;
    document.getElementById('nextDate').value = caseToEdit.nextDate;
    document.getElementById('status').value = caseToEdit.status;
    document.getElementById('notes').value = caseToEdit.notes || ''; 
    
    document.getElementById('paymentStatus').value = caseToEdit.paymentStatus || 'not_paid';
    document.getElementById('isFeatured').checked = caseToEdit.isFeatured || false;
    
    document.getElementById('saveButton').textContent = 'حفظ التعديلات'; 
    caseModal.style.display = 'block'; 
}

// معالج حدث حفظ النموذج (Handle Save) - يتصل بـ Firestore
caseForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const idValue = document.getElementById('caseId').value;
    const isEditing = !!idValue; 
    
    const caseData = {
        number: document.getElementById('number').value,
        client: document.getElementById('client').value,
        subject: document.getElementById('subject').value,
        nextDate: document.getElementById('nextDate').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value,
        paymentStatus: document.getElementById('paymentStatus').value,
        isFeatured: document.getElementById('isFeatured').checked 
        // لا نضمّن ID هنا لأنه إما يُضاف تلقائياً (Add) أو يُستخدم للتحديث (Set)
    };

    try {
        if (isEditing) {
            // التعديل: استخدام doc(id) للتحديد و set() للتحديث/الكتابة
            await casesCollection.doc(idValue).set(caseData, { merge: true });
        } else {
            // الإنشاء: استخدام add() لإنشاء مستند جديد بمعرّف تلقائي
            await casesCollection.add(caseData);
        }
    } catch (error) {
        console.error("خطأ في حفظ البيانات إلى Firebase:", error);
        alert("فشل في حفظ البيانات. تأكد من اتصالك بالإنترنت وصلاحيات Firebase.");
        return; 
    }

    // بعد نجاح الحفظ في Firestore، نقوم بإعادة التحميل وعرض البيانات المحدثة
    closeModal();
    await loadCasesData(); // جلب البيانات الجديدة
    renderCases(casesData); 
});


// وظيفة الحذف (Delete) - تتصل بـ Firestore
async function deleteCase(id) {
    closePopover();
    if (confirm('هل أنت متأكد من حذف هذه القضية؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        try {
            // الحذف: استخدام doc(id) لحذف السجل المحدد
            await casesCollection.doc(id).delete();
            
            // إعادة تحميل وعرض البيانات المحدثة
            await loadCasesData();
            renderCases(casesData);
        } catch (error) {
            console.error("خطأ في حذف البيانات من Firebase:", error);
            alert("فشل في حذف البيانات. تأكد من صلاحيات Firebase.");
        }
    }
}


// ----------------------------------------------------
// تشغيل النظام
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    // تحديد نوع الصفحة الحالية
    const pageId = document.body.id;
    isArchivePage = pageId === 'pageArchive';
    isFeaturedPage = pageId === 'pageFeatured';
    
    // تحميل الثيم المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        setDarkTheme(true);
    } else {
        setDarkTheme(false); 
    }

    // تحميل وعرض البيانات من Firebase
    await loadCasesData(); 
    renderCases(casesData); 
    
    // *** بدء تحديث التاريخ والأذكار ***
    updateDateAndTime(); 
    setInterval(updateDateAndTime, 1000); 
    
    updateTasbeeh(); 
    setInterval(updateTasbeeh, 15000); 
});