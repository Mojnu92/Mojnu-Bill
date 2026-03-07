import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// আপনার সঠিক কনফিগারেশন (সিঙ্গাপুর সার্ভারসহ)
const firebaseConfig = {
    apiKey: "AIzaSyDkNUNq0bbEAguSW2nCvJ1IqdG7_wBj7U0",
    authDomain: "mojnu-screen-print.firebaseapp.com",
    databaseURL: "https://mojnu-screen-print-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mojnu-screen-print",
    storageBucket: "mojnu-screen-print.firebasestorage.app",
    messagingSenderId: "807078340924",
    appId: "1:807078340924:web:5c5efcbcaf19eb0a47d639",
    measurementId: "G-GPP2BCTMCV"
};

// ডাটাবেজ শুরু করা
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// অনলাইনে ডাটা পাঠানোর ফাংশন (Sync Function)
window.syncToCloud = function() {
    const data = {
        bills: JSON.parse(localStorage.getItem("mj_3d_bills")) || [],
        stocks: JSON.parse(localStorage.getItem("mj_3d_stock")) || {},
        customers: JSON.parse(localStorage.getItem("mj_3d_cust")) || {},
        nextId: localStorage.getItem("mj_3d_id") || 1001,
        config: JSON.parse(localStorage.getItem("mj_3d_config")) || {},
        lastSync: new Date().toLocaleString() // সেভ হওয়ার সময়
    };

    set(ref(db, 'shop_data/'), data)
    .then(() => console.log("অভিনন্দন! ডাটা অনলাইনে সেভ হয়েছে।"))
    .catch((error) => console.error("সেভ করতে সমস্যা হয়েছে:", error));
}

// অনলাইন থেকে ডাটা পিসিতে আপডেট করা
onValue(ref(db, 'shop_data/'), (snapshot) => {
    const data = snapshot.val();
    if(data) {
        localStorage.setItem("mj_3d_bills", JSON.stringify(data.bills));
        localStorage.setItem("mj_3d_stock", JSON.stringify(data.stocks));
        localStorage.setItem("mj_3d_cust", JSON.stringify(data.customers));
        localStorage.setItem("mj_3d_id", data.nextId);
        localStorage.setItem("mj_3d_config", JSON.stringify(data.config));
        
        // আপনার সাইটের মেইন রেন্ডার ফাংশন কল করা
        if(typeof render === "function") render();
    }
});

// ৩. অটোমেটিক সেভ হওয়ার টাইমার (১২০ সেকেন্ড পর পর)
setInterval(() => {
    window.syncToCloud();
}, 120000); 

// প্রথমবার পেজ লোড হলে একবার সেভ হবে
window.syncToCloud();