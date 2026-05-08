let currentUser = null;
let isAdmin = false;

// Admin credentials
const ADMIN_EMAIL = 'ahmed@gmail.com';
const ADMIN_PASSWORD = '1234';

// Check if current user is admin
function checkAdminRole() {
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
        isAdmin = true;
        return true;
    }
    isAdmin = false;
    return false;
}

let doctors = [];
let vetsData = [];
let petsData = [];
let ownersData = [];
let departmentsData = [];
let medicalRecordsData = [];
let appointmentsData = [];
let currentPetFilter = 'all';
let currentRecordFilter = 'all';
let currentAppointmentFilter = 'all';


// Load appointments data from JSON file
async function loadAppointmentsData() {
    try {
        const response = await fetch('appointments_data.json');
        appointmentsData = await response.json();
        console.log('Loaded appointments data:', appointmentsData.length, 'appointments');
        renderAppointments();
    } catch (error) {
        console.error('Error loading appointments data:', error);
    }
}

// Filter appointments
function filterAppointments(status) {
    currentAppointmentFilter = status;
    renderAppointments();
}

// Render appointments cards
function renderAppointments() {
    let container = document.getElementById("appointmentCards");
    container.innerHTML = "";
    
    let filteredAppointments = appointmentsData;
    
    // Apply filtering based on currentAppointmentFilter
    if (currentAppointmentFilter !== 'all') {
        filteredAppointments = appointmentsData.filter(apt => apt.status === currentAppointmentFilter);
    }
    
    filteredAppointments.forEach((appointment, index) => {
        let div = document.createElement("div");
        div.className = "card";
        div.style.opacity = "0";
        div.style.transform = "translateY(20px)";
        
        // Find pet and vet information
        const pet = petsData.find(p => p.pet_id === appointment.pet_id);
        const vet = vetsData.find(v => v.vet_id === appointment.vet_id);
        const statusEmoji = appointment.status === 'scheduled' ? '📅' : appointment.status === 'completed' ? '✅' : '❌';
        
        const petName = pet ? pet.pet_name : `Pet ID: ${appointment.pet_id}`;
        const vetName = vet ? `Dr. ${vet.vet_name}` : `Vet ID: ${appointment.vet_id}`;
        const petEmoji = pet && pet.animal_type === 'dog' ? '🐕' : pet && pet.animal_type === 'cat' ? '🐈' : pet && pet.animal_type === 'bird' ? '🦜' : '🐾';
        
        div.innerHTML = `
            <h4>${statusEmoji} Appointment #${appointment.appointment_id}</h4>
            <p><strong>Pet:</strong> ${petEmoji} ${petName}</p>
            <p><strong>Vet:</strong> ${vetName}</p>
            <p><strong>Date:</strong> ${appointment.appointment_date}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
            <button onclick="viewAppointment(${appointment.appointment_id})">View Details</button>
        `;
        
        container.appendChild(div);

        setTimeout(() => {
            div.style.transition = "all 0.5s ease";
            div.style.opacity = "1";
            div.style.transform = "translateY(0)";
        }, index * 50);
    });
}

// View appointment details
function viewAppointment(appointmentId) {
    let appointment = appointmentsData.find(a => a.appointment_id === appointmentId);
    if (!appointment) return;
    
    // Find related data
    const pet = petsData.find(p => p.pet_id === appointment.pet_id);
    const vet = vetsData.find(v => v.vet_id === appointment.vet_id);
    const medicalRecord = medicalRecordsData.find(r => r.appointment_id === appointment.appointment_id);
    
    const statusEmoji = appointment.status === 'scheduled' ? '📅' : appointment.status === 'completed' ? '✅' : '❌';
    const petName = pet ? pet.pet_name : `Pet ID: ${appointment.pet_id}`;
    const vetName = vet ? `Dr. ${vet.vet_name}` : `Vet ID: ${appointment.vet_id}`;
    const petEmoji = pet && pet.animal_type === 'dog' ? '🐕' : pet && pet.animal_type === 'cat' ? '🐈' : pet && pet.animal_type === 'bird' ? '🦜' : '🐾';
    
    let medicalInfo = '';
    if (medicalRecord) {
        const diagnosisEmoji = medicalRecord.diagnosis === 'Infection' ? '🦠' : medicalRecord.diagnosis === 'Vaccine' ? '💉' : '🏥';
        medicalInfo = `
            <h3>Medical Record</h3>
            <p><strong>Diagnosis:</strong> ${diagnosisEmoji} ${medicalRecord.diagnosis}</p>
            <p><strong>Treatment:</strong> ${medicalRecord.treatment || 'No treatment recorded'}</p>
            <p><strong>Notes:</strong> ${medicalRecord.notes || 'No notes'}</p>
        `;
    }
    
    let petInfo = '';
    if (pet) {
        let ownerInfo = '';
        if (pet.owner_id) {
            const owner = ownersData.find(o => o.owner_id === pet.owner_id);
            if (owner) {
                ownerInfo = `
                    <p><strong>Owner:</strong> ${owner.owner_name}</p>
                    <p><strong>Owner Phone:</strong> ${owner.phone}</p>
                `;
            }
        } else {
            ownerInfo = '<p><strong>Status:</strong> Available for adoption 🏠</p>';
        }
        
        petInfo = `
            <h3>Pet Information</h3>
            <p><strong>Name:</strong> ${petName}</p>
            <p><strong>Type:</strong> ${pet.animal_type}</p>
            <p><strong>Age:</strong> ${pet.age} years</p>
            ${ownerInfo}
        `;
    }
    
    document.getElementById("cvContainer").innerHTML = `
        <div class="cv">
            <h2>${statusEmoji} Appointment #${appointment.appointment_id}</h2>
            <h3>Appointment Details</h3>
            <p><strong>Date:</strong> ${appointment.appointment_date}</p>
            <p><strong>Status:</strong> ${appointment.status}</p>
            <p><strong>Vet:</strong> ${vetName}</p>
            ${petInfo}
            ${medicalInfo}
            <button onclick="showSection('appointments')">⬅ Back to Appointments</button>
        </div>
    `;
    
    showSection("cvPage");
}

// Load medical records data from JSON file
async function loadMedicalRecordsData() {
    try {
        const response = await fetch('medical_records_data.json');
        medicalRecordsData = await response.json();
        console.log('Loaded medical records data:', medicalRecordsData.length, 'records');
        renderMedicalRecords();
    } catch (error) {
        console.error('Error loading medical records data:', error);
    }
}

// Filter medical records
function filterRecords(type) {
    currentRecordFilter = type;
    renderMedicalRecords();
}

// Render medical records cards
function renderMedicalRecords() {
    let container = document.getElementById("recordCards");
    container.innerHTML = "";
    
    let filteredRecords = medicalRecordsData;
    
    // Apply filtering based on currentRecordFilter
    if (currentRecordFilter === 'diagnosis') {
        // Group by diagnosis and show unique diagnoses
        let uniqueDiagnoses = [...new Set(medicalRecordsData.map(r => r.diagnosis))];
        uniqueDiagnoses.forEach((diagnosis, index) => {
            let div = document.createElement("div");
            div.className = "card";
            div.style.opacity = "0";
            div.style.transform = "translateY(20px)";
            const diagnosisEmoji = diagnosis === 'Infection' ? '🦠' : diagnosis === 'Vaccine' ? '💉' : '🏥';
            const count = medicalRecordsData.filter(r => r.diagnosis === diagnosis).length;
            
            div.innerHTML = `
                <h4>${diagnosisEmoji} ${diagnosis}</h4>
                <p><strong>Records:</strong> ${count} cases</p>
                <button onclick="showDiagnosisRecords('${diagnosis}')">View Records</button>
            `;
            container.appendChild(div);

            setTimeout(() => {
                div.style.transition = "all 0.5s ease";
                div.style.opacity = "1";
                div.style.transform = "translateY(0)";
            }, index * 100);
        });
        return;
    } else if (currentRecordFilter === 'treatment') {
        // Group by treatment type
        let uniqueTreatments = [...new Set(medicalRecordsData.map(r => r.treatment || 'No treatment recorded'))];
        uniqueTreatments.forEach((treatment, index) => {
            let div = document.createElement("div");
            div.className = "card";
            div.style.opacity = "0";
            div.style.transform = "translateY(20px)";
            const count = medicalRecordsData.filter(r => (r.treatment || 'No treatment recorded') === treatment).length;
            const treatmentText = treatment.length > 30 ? treatment.substring(0, 30) + '...' : treatment;
            
            div.innerHTML = `
                <h4>💊 ${treatmentText}</h4>
                <p><strong>Records:</strong> ${count} cases</p>
                <button onclick="showTreatmentRecords('${treatment}')">View Records</button>
            `;
            container.appendChild(div);

            setTimeout(() => {
                div.style.transition = "all 0.5s ease";
                div.style.opacity = "1";
                div.style.transform = "translateY(0)";
            }, index * 100);
        });
        return;
    }
    
    // Show all records
    filteredRecords.forEach((record, index) => {
        let div = document.createElement("div");
        div.className = "card";
        div.style.opacity = "0";
        div.style.transform = "translateY(20px)";
        
        const diagnosisEmoji = record.diagnosis === 'Infection' ? '🦠' : record.diagnosis === 'Vaccine' ? '💉' : '🏥';
        const treatmentText = record.treatment && record.treatment !== 'No treatment recorded' ? record.treatment.substring(0, 50) + '...' : 'No treatment recorded';
        const notesText = record.notes ? record.notes.substring(0, 30) + '...' : 'No notes';
        
        div.innerHTML = `
            <h4>${diagnosisEmoji} Record #${record.record_id}</h4>
            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
            <p><strong>Treatment:</strong> ${treatmentText}</p>
            <p><strong>Notes:</strong> ${notesText}</p>
            <p><strong>Appointment ID:</strong> ${record.appointment_id || 'N/A'}</p>
            <button onclick="viewMedicalRecord(${record.record_id})">View Details</button>
        `;
        
        container.appendChild(div);

        setTimeout(() => {
            div.style.transition = "all 0.5s ease";
            div.style.opacity = "1";
            div.style.transform = "translateY(0)";
        }, index * 30);
    });
}

// Show records by diagnosis
function showDiagnosisRecords(diagnosis) {
    let container = document.getElementById("recordCards");
    container.innerHTML = "";
    
    let filteredRecords = medicalRecordsData.filter(r => r.diagnosis === diagnosis);
    
    filteredRecords.forEach(record => {
        let div = document.createElement("div");
        div.className = "card";
        
        const diagnosisEmoji = record.diagnosis === 'Infection' ? '🦠' : record.diagnosis === 'Vaccine' ? '💉' : '🏥';
        const treatmentText = record.treatment && record.treatment !== 'No treatment recorded' ? record.treatment.substring(0, 50) + '...' : 'No treatment recorded';
        const notesText = record.notes ? record.notes.substring(0, 30) + '...' : 'No notes';
        
        div.innerHTML = `
            <h4>${diagnosisEmoji} Record #${record.record_id}</h4>
            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
            <p><strong>Treatment:</strong> ${treatmentText}</p>
            <p><strong>Notes:</strong> ${notesText}</p>
            <p><strong>Appointment ID:</strong> ${record.appointment_id || 'N/A'}</p>
            <button onclick="viewMedicalRecord(${record.record_id})">View Details</button>
        `;
        
        container.appendChild(div);
    });
    
    // Add back button
    let backBtn = document.createElement("button");
    backBtn.innerHTML = "⬅ Back to All Filters";
    backBtn.onclick = () => filterRecords('all');
    backBtn.style.margin = "10px";
    container.appendChild(backBtn);
}

// Show records by treatment
function showTreatmentRecords(treatment) {
    let container = document.getElementById("recordCards");
    container.innerHTML = "";
    
    let filteredRecords = medicalRecordsData.filter(r => (r.treatment || 'No treatment recorded') === treatment);
    
    filteredRecords.forEach(record => {
        let div = document.createElement("div");
        div.className = "card";
        
        const diagnosisEmoji = record.diagnosis === 'Infection' ? '🦠' : record.diagnosis === 'Vaccine' ? '💉' : '🏥';
        const treatmentText = record.treatment && record.treatment !== 'No treatment recorded' ? record.treatment.substring(0, 50) + '...' : 'No treatment recorded';
        const notesText = record.notes ? record.notes.substring(0, 30) + '...' : 'No notes';
        
        div.innerHTML = `
            <h4>${diagnosisEmoji} Record #${record.record_id}</h4>
            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
            <p><strong>Treatment:</strong> ${treatmentText}</p>
            <p><strong>Notes:</strong> ${notesText}</p>
            <p><strong>Appointment ID:</strong> ${record.appointment_id || 'N/A'}</p>
            <button onclick="viewMedicalRecord(${record.record_id})">View Details</button>
        `;
        
        container.appendChild(div);
    });
    
    // Add back button
    let backBtn = document.createElement("button");
    backBtn.innerHTML = "⬅ Back to All Filters";
    backBtn.onclick = () => filterRecords('all');
    backBtn.style.margin = "10px";
    container.appendChild(backBtn);
}

// View medical record details
function viewMedicalRecord(recordId) {
    let record = medicalRecordsData.find(r => r.record_id === recordId);
    if (!record) return;
    
    const diagnosisEmoji = record.diagnosis === 'Infection' ? '🦠' : record.diagnosis === 'Vaccine' ? '💉' : '🏥';
    
    document.getElementById("cvContainer").innerHTML = `
        <div class="cv">
            <h2>${diagnosisEmoji} Medical Record #${record.record_id}</h2>
            <h3>Medical Information</h3>
            <p><strong>Record ID:</strong> ${record.record_id}</p>
            <p><strong>Appointment ID:</strong> ${record.appointment_id || 'N/A'}</p>
            <p><strong>Diagnosis:</strong> ${record.diagnosis}</p>
            <p><strong>Treatment:</strong> ${record.treatment || 'No treatment recorded'}</p>
            <p><strong>Notes:</strong> ${record.notes || 'No notes'}</p>
            <button onclick="showSection('medicalRecords')">⬅ Back to Medical Records</button>
        </div>
    `;
    
    showSection("cvPage");
}

// Load departments data from JSON file
async function loadDepartmentsData() {
    try {
        const response = await fetch('departments_data.json');
        departmentsData = await response.json();
        console.log('Loaded departments data:', departmentsData.length, 'departments');
    } catch (error) {
        console.error('Error loading departments data:', error);
        // Fallback to hardcoded departments if JSON fails to load
        departmentsData = [
            { department_id: 1, department_name: "General" },
            { department_id: 2, department_name: "Surgery" },
            { department_id: 5, department_name: "Dental" },
            { department_id: 6, department_name: "Emergency" }
        ];
    }
}

// Get department name by ID
function getDepartmentName(departmentId) {
    const department = departmentsData.find(d => d.department_id === departmentId);
    return department ? department.department_name : "General Practice";
}

// Load owners data from JSON file
async function loadOwnersData() {
    try {
        const response = await fetch('owners_data.json');
        ownersData = await response.json();
        console.log('Loaded owners data:', ownersData.length, 'owners');
    } catch (error) {
        console.error('Error loading owners data:', error);
    }
}

// Load pets data from JSON file
async function loadPetsData() {
    try {
        const response = await fetch('pets_data.json');
        petsData = await response.json();
        console.log('Loaded pets data:', petsData.length, 'pets');
        renderPets();
    } catch (error) {
        console.error('Error loading pets data:', error);
    }
}

// Filter pets by animal type
function filterPets(type) {
    currentPetFilter = type;
    renderPets();
}

// Render pets cards
function renderPets() {
    let container = document.getElementById("petCards");
    container.innerHTML = "";
    
    let filteredPets = currentPetFilter === 'all' 
        ? petsData 
        : petsData.filter(pet => pet.animal_type === currentPetFilter);
    
    filteredPets.forEach((pet, index) => {
        let div = document.createElement("div");
        div.className = "card";
        div.style.opacity = "0";
        div.style.transform = "translateY(20px)";
        
        const ownerStatus = pet.owner_id ? `Owner ID: ${pet.owner_id}` : 'Available for adoption';
        const animalEmoji = pet.animal_type === 'dog' ? '🐕' : pet.animal_type === 'cat' ? '🐈' : '🦜';
        
        div.innerHTML = `
            <h4 class="pop-up-text">${animalEmoji} ${pet.pet_name}</h4>
            <p class="pop-up-text">Type: ${pet.animal_type}</p>
            <p class="pop-up-text">Age: ${pet.age} years</p>
            <p class="pop-up-text">${ownerStatus}</p>
            <button onclick="viewPetDetails(${pet.pet_id})">View Details</button>
        `;
        
        container.appendChild(div);

        setTimeout(() => {
            div.style.transition = "all 0.5s ease";
            div.style.opacity = "1";
            div.style.transform = "translateY(0)";
        }, index * 50);
    });
}

// View pet details
function viewPetDetails(petId) {
    let pet = petsData.find(p => p.pet_id === petId);
    if (!pet) return;
    
    const animalEmoji = pet.animal_type === 'dog' ? '🐕' : pet.animal_type === 'cat' ? '🐈' : '🦜';
    let ownerInfo = '';
    
    if (pet.owner_id) {
        let owner = ownersData.find(o => o.owner_id === pet.owner_id);
        if (owner) {
            ownerInfo = `
                <h3>Owner Information</h3>
                <p><strong>Name:</strong> ${owner.owner_name}</p>
                <p><strong>Phone:</strong> ${owner.phone}</p>
                <p><strong>Address:</strong> ${owner.address || 'Not available'}</p>
            `;
        } else {
            ownerInfo = `<p><strong>Owner ID:</strong> ${pet.owner_id} (Owner details not found)</p>`;
        }
    } else {
        ownerInfo = '<p><strong>Status:</strong> Available for adoption 🏠</p>';
    }
    
    document.getElementById("cvContainer").innerHTML = `
        <div class="cv">
            <h2>${animalEmoji} ${pet.pet_name}</h2>
            <h3>Pet Information</h3>
            <p><strong>Pet ID:</strong> ${pet.pet_id}</p>
            <p><strong>Type:</strong> ${pet.animal_type}</p>
            <p><strong>Age:</strong> ${pet.age} years</p>
            ${ownerInfo}
            <button onclick="showSection('pets')">⬅ Back to Pets</button>
        </div>
    `;
    
    showSection("cvPage");
}

// Load vets data from JSON file
async function loadVetsData() {
    try {
        const response = await fetch('vets_data.json');
        vetsData = await response.json();
        
        // Convert vets data to doctors format with additional info
        doctors = vetsData.map(vet => {
            const specialization = getDepartmentName(vet.department_id);
            return {
                name: `Dr. ${vet.vet_name}`,
                specialization: specialization,
                age: Math.floor(Math.random() * 20) + 30, // Random age between 30-50
                experience: `${Math.floor(Math.random() * 15) + 5} years`, // Random experience 5-20 years
                times: generateAvailableTimes(),
                vet_id: vet.vet_id,
                department_id: vet.department_id
            };
        });
        
        console.log('Loaded vets data:', doctors.length, 'doctors');
    } catch (error) {
        console.error('Error loading vets data:', error);
        // Fallback to default doctors if JSON fails to load
        doctors = [
            { name: "Dr. Ahmed", specialization:"Surgery", age:45, experience:"10 years", times:["9:00","10:00","11:00","1:00"] },
            { name: "Dr. Sara", specialization:"Pet Care", age:38, experience:"7 years", times:["9:30","11:30","2:00"] },
            { name: "Dr. Ali", specialization:"Dentistry", age:40, experience:"8 years", times:["10:00","12:00","3:00"] },
            { name: "Dr. Mona", specialization:"Dermatology", age:35, experience:"6 years", times:["9:00","1:00","4:00"] },
            { name: "Dr. Omar", specialization:"Emergency", age:42, experience:"12 years", times:["8:00","10:30","2:30"] }
        ];
    }
}

// Generate random available times for each doctor
function generateAvailableTimes() {
    const allTimes = ["8:00", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "1:00", "2:00", "2:30", "3:00", "4:00"];
    const numSlots = Math.floor(Math.random() * 4) + 3; // 3-6 time slots
    const shuffled = allTimes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numSlots);
}

let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

// Show section with admin-only restrictions
function showSection(id) {
    // Check admin-only sections
    const adminOnlySections = ['medicalRecords', 'appointments', 'pets', 'myBookings'];
    
    if (adminOnlySections.includes(id) && !isAdmin) {
        showPopup("🔒 Admin access required to view this section");
        return;
    }
    
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    // login mode
    if (id === "loginPage") {
        document.body.classList.add("login-mode");
    } else {
        document.body.classList.remove("login-mode");
    }

    // 🔥 تشغيل الإعلان
    showOffer();
}
// Doctors dropdown
function loadDoctors() {
    let select = document.getElementById("doctorSelect");
    select.innerHTML = `<option value="">Select Doctor</option>`;

    doctors.forEach((doc, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = doc.name;
        select.appendChild(option);
    });
}

// Available times
function updateTimes() {
    let doctorIndex = document.getElementById("doctorSelect").value;
    let container = document.getElementById("timeContainer");
    container.innerHTML = "";

    if (doctorIndex === "") return;

    doctors[doctorIndex].times.forEach(time => {

        let isBooked = bookings.some(b => 
            b.doctor == doctorIndex && b.time == time
        );

        if (isBooked) return;

        let btn = document.createElement("button");
        btn.className = "time-btn";
        btn.innerText = time;

        btn.onclick = () => {
            document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
        };

        container.appendChild(btn);
    });
}

// Booking
function confirmBooking() {
    let docIndex = document.getElementById("doctorSelect").value;
    let selected = document.querySelector(".time-btn.selected");

    if (docIndex === "" || !selected) {
        showPopup("Please select doctor & time");
        return;
    }

    let booking = {
        doctor: docIndex,
        doctorName: doctors[docIndex].name,
        time: selected.innerText,
        date: new Date().getTime(),
        userEmail: currentUser ? currentUser.email : 'guest'
    };

    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    showPopup("Booked with " + booking.doctorName);
    addNotification("Booked with " + booking.doctorName + " at " + booking.time);

    updateTimes();
    renderBookings();
}

// Cancel
function cancelBooking(index) {
    let now = new Date().getTime();
    let diff = (now - bookings[index].date)/(1000*60*60);

    if(diff > 12){
        showPopup("❌ 500 EGP fine");
    } else {
        showPopup("Cancelled");
    }

    addNotification("Booking cancelled");

    bookings.splice(index,1);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    renderBookings();
    updateTimes();
}

// Render bookings with role-based access control
function renderBookings() {
    let container = document.getElementById("bookingList");
    container.innerHTML = "";

    // Filter bookings based on user role
    let bookingsToShow = [];
    if (isAdmin) {
        // Admin can see all bookings
        bookingsToShow = bookings;
    } else if (currentUser) {
        // Regular users can only see their own bookings
        bookingsToShow = bookings.filter(b => b.userEmail === currentUser.email);
    }

    if (bookingsToShow.length === 0) {
        container.innerHTML = `
            <div class="card">
                <h3>${isAdmin ? 'No bookings found' : 'No bookings found. Book an appointment to see your bookings here!'}</h3>
                <p>${isAdmin ? 'All user bookings will appear here' : 'Your bookings will appear here after you book an appointment'}</p>
            </div>
        `;
        return;
    }

    bookingsToShow.forEach((b, index) => {
        let div = document.createElement("div");
        div.className = "card";

        // Show user info for admin
        let userInfo = isAdmin ? `<p><strong>User:</strong> ${b.userEmail || 'Unknown'}</p>` : '';
        
        div.innerHTML = `
            <h4>${b.doctorName}</h4>
            <p><strong>Time:</strong> ${b.time}</p>
            <p><strong>Date:</strong> ${new Date(b.date).toLocaleDateString()}</p>
            ${userInfo}
            <button onclick="cancelBooking(${index})">Cancel</button>
        `;

        container.appendChild(div);
    });
}

// Popup
function showPopup(msg) {
    let p = document.getElementById("popup");
    p.innerText = msg;
    p.style.display = "block";

    setTimeout(() => p.style.display = "none", 2000);
}

// Notifications
function addNotification(msg) {
    notifications.push(msg);
    localStorage.setItem("notifications", JSON.stringify(notifications));
}

function toggleNotifications() {
    let box = document.getElementById("notifList");

    if (box.style.display === "block") {
        box.style.display = "none";
        return;
    }

    box.innerHTML = "";
    notifications.forEach(n => {
        let div = document.createElement("div");
        div.className = "notif-item";
        div.innerText = n;
        box.appendChild(div);
    });

    box.style.display = "block";
}

// Doctors cards
function renderDoctors() {
    let container = document.getElementById("doctorCards");
    container.innerHTML = "";

    doctors.forEach((doc, index) => {
        let div = document.createElement("div");
        div.className = "card";
        div.style.opacity = "0";
        div.style.transform = "translateY(20px)";

        div.innerHTML = `
            <h4 class="pop-up-text">${doc.name}</h4>
            <p class="pop-up-text">${doc.specialization}</p>
            <button onclick="openCV(${index})">View CV</button>
        `;

        container.appendChild(div);

        setTimeout(() => {
            div.style.transition = "all 0.5s ease";
            div.style.opacity = "1";
            div.style.transform = "translateY(0)";
        }, index * 100);
    });
}

// CV
function openCV(index) {
    let doc = doctors[index];

    document.getElementById("cvContainer").innerHTML = `
        <div class="cv">
            <h2>${doc.name}</h2>
            <p>Specialization: ${doc.specialization}</p>
            <p>Age: ${doc.age}</p>
            <p>Experience: ${doc.experience}</p>
        </div>
    `;

    showSection("cvPage");
}

// Contact toggle
function toggleInfo(id) {
    let el = document.getElementById(id);
    document.querySelectorAll(".info-box").forEach(b => {
        if (b.id !== id) b.classList.remove("show");
    });
    el.classList.toggle("show");
}

// ✅ أهم تعديل هنا
window.onload = async function () {
    await loadDepartmentsData(); // Load departments data first
    await loadVetsData(); // Load vets data
    await loadOwnersData(); // Load owners data
    await loadPetsData(); // Load pets data
    await loadMedicalRecordsData(); // Load medical records data
    await loadAppointmentsData(); // Load appointments data
    loadDoctors();
    renderDoctors();
    renderBookings();

    // Check if user is already logged in and set admin role
    let savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        checkAdminRole();
    }

    showSection("loginPage"); // 👈 دايما يبدأ من اللوجين
};
function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    
    if (!email || !password) {
        showPopup("Please fill in all fields");
        return;
    }
    
    // Check if user exists in localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let existingUser = users.find(u => u.email === email && u.password === password);
    
    if (!existingUser) {
        showPopup("Wrong email or password ❌");
        return;
    }
    
    currentUser = existingUser;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    
    // Check if user is admin
    checkAdminRole();
    
    if (isAdmin) {
        showPopup("Admin login successful!");
    } else {
        showPopup("Login successful!");
    }
    
    setTimeout(() => {
        showSection("dashboard");
    }, 1000);
}

// User box
function toggleUser() {
    let box = document.getElementById("userBox");

    if (box.style.display === "block") {
        box.style.display = "none";
        return;
    }

    if (!currentUser) {
        box.innerHTML = `<p>Not logged in</p>`;
    } else {
        let roleBadge = isAdmin ? '<span style="background: #ff6ec7; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">👑 ADMIN</span>' : '<span style="background: #00d4ff; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem;">👤 USER</span>';
        
        box.innerHTML = `
            <p>${currentUser.email}</p>
            <p>${roleBadge}</p>
            <p>Logged in ✅</p>
            <button onclick="logout()">Logout</button>
        `;
    }

    box.style.display = "block";
}
function logout() {
    currentUser = null;
    isAdmin = false;

    localStorage.removeItem("currentUser");

    showPopup("Logged out");

    showSection("loginPage");
}

// =========================
// 🎁 OFFER POPUP
// =========================

function showOffer() {

    let offer = document.getElementById("offerPopup");

    let activeSection = document.querySelector("section.active");

    if (!activeSection) return;

    // يظهر بس هنا
    if (
        activeSection.id === "appointment" ||
        activeSection.id === "myBookings"
    ) {

        offer.style.display = "block";

    } else {

        offer.style.display = "none";
    }
}

function closeOffer() {
    document.getElementById("offerPopup").style.display = "none";
}

window.onload = async function () {
    await loadDepartmentsData();
    await loadVetsData();
    await loadOwnersData();
    await loadPetsData();
    await loadMedicalRecordsData();
    await loadAppointmentsData();
    loadDoctors();
    renderDoctors();
    renderBookings();

    showSection("loginPage");
};