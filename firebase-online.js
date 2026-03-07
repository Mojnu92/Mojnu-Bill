import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ডাটা অনলাইনে পাঠানোর ফাংশন
window.syncToCloud = function() {
    const data = {
        bills: JSON.parse(localStorage.getItem("mj_3d_bills")) || [],
        stocks: JSON.parse(localStorage.getItem("mj_3d_stock")) || {},
        customers: JSON.parse(localStorage.getItem("mj_3d_cust")) || {},
        nextId: localStorage.getItem("mj_3d_id") || 1001,
        config: JSON.parse(localStorage.getItem("mj_3d_config")) || {},
        lastSync: new Date().getTime() // সময়টা নম্বর হিসেবে রাখলে সুবিধা
    };

    set(ref(db, 'shop_data/'), data)
    .then(() => console.log("ক্লাউডে সেভ হয়েছে!"))
    .catch((error) => console.error("সেভ এরর:", error));
}

// ডাটাবেজে কোনো পরিবর্তন হলেই এই অংশটি অটোমেটিক চলবে
onValue(ref(db, 'shop_data/'), (snapshot) => {
    const data = snapshot.val();
    if(data) {
        // পিসির লোকাল ডাটার সাথে মিলানো হচ্ছে
        localStorage.setItem("mj_3d_bills", JSON.stringify(data.bills));
        localStorage.setItem("mj_3d_stock", JSON.stringify(data.stocks));
        localStorage.setItem("mj_3d_cust", JSON.stringify(data.customers));
        localStorage.setItem("mj_3d_id", data.nextId);
        localStorage.setItem("mj_3d_config", JSON.stringify(data.config));
        
        console.log("অনলাইন থেকে নতুন ডাটা পাওয়া গেছে!");

        // এই লাইনটি খুবই গুরুত্বপূর্ণ: পেজ অটো আপডেট করবে
        if(typeof render === "function") {
            render(); 
        } else {
            // যদি রেন্ডার ফাংশন সরাসরি না পায়, তবে ১ সেকেন্ড পর আবার চেষ্টা করবে
            setTimeout(() => { if(typeof render === "function") render(); }, 1000);
        }
    }
}, (error) => {
    console.error("ডাটা আনতে সমস্যা:", error);
});

// পেজ খোলার ৫ সেকেন্ড পর প্রথমবার ডাটা পাঠাবে
setTimeout(() => {
    window.syncToCloud();
}, 5000);

// প্রতি ৬০ সেকেন্ড পর পর অটো ব্যাকআপ
setInterval(() => {
    window.syncToCloud();
}, 60000);
