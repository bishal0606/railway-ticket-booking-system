const API_BASE_URL = 'php/api';

let selectedTrain = null;
let passengerCount = 1;
const maxPassengers = 4;

document.addEventListener('DOMContentLoaded', function() {
    loadTrainDetails();
    updateTotalAmount();
});

async function loadTrainDetails() {
    const trainId = sessionStorage.getItem('selectedTrainId');
    const journeyDate = sessionStorage.getItem('journeyDate');
    
    if (!trainId || !journeyDate) {
        alert('No train selected! Redirecting to search page...');
        window.location.href = 'search.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/trains.php?id=${trainId}`);
        const result = await response.json();
        
        if (result.success) {
            selectedTrain = result.data;
            selectedTrain.journeyDate = journeyDate;
            displayTrainSummary();
        } else {
            alert('Failed to load train details: ' + result.message);
            window.location.href = 'search.html';
        }
        
    } catch (error) {
        console.error('Error loading train:', error);
        alert('Failed to load train details. Please try again.');
        window.location.href = 'search.html';
    }
}

function displayTrainSummary() {
    const summaryDiv = document.getElementById('trainSummary');
    
    summaryDiv.innerHTML = `
        <h3 style="color: #1a4d8f; margin-bottom: 15px;">Journey Details</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            <div>
                <strong>Train:</strong> ${selectedTrain.train_name} (${selectedTrain.train_number})
            </div>
            <div>
                <strong>Class:</strong> ${selectedTrain.train_class}
            </div>
            <div>
                <strong>From:</strong> ${selectedTrain.source_station}
            </div>
            <div>
                <strong>To:</strong> ${selectedTrain.destination_station}
            </div>
            <div>
                <strong>Departure:</strong> ${selectedTrain.departure_time}
            </div>
            <div>
                <strong>Arrival:</strong> ${selectedTrain.arrival_time}
            </div>
            <div>
                <strong>Journey Date:</strong> ${formatDate(selectedTrain.journeyDate)}
            </div>
            <div>
                <strong>Duration:</strong> ${selectedTrain.duration}
            </div>
            <div>
                <strong>Price per ticket:</strong> <span style="color: #28a745; font-weight: bold;">₹${selectedTrain.price}</span>
            </div>
            <div>
                <strong>Available Seats:</strong> ${selectedTrain.available_seats}
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', options);
}

function addPassenger() {
    if (passengerCount >= maxPassengers) {
        alert(`Maximum ${maxPassengers} passengers allowed per booking!`);
        return;
    }
    
    if (passengerCount >= selectedTrain.available_seats) {
        alert(`Only ${selectedTrain.available_seats} seats available!`);
        return;
    }
    
    passengerCount++;
    const container = document.getElementById('passengersContainer');
    
    const passengerHTML = `
        <div class="passenger-details" id="passenger${passengerCount}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Passenger ${passengerCount}</h3>
                <button type="button" class="btn btn-danger btn-small" onclick="removePassenger(${passengerCount})">
                    Remove
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="name${passengerCount}">Full Name *</label>
                    <input type="text" id="name${passengerCount}" name="name${passengerCount}" required placeholder="Enter full name">
                </div>
                <div class="form-group">
                    <label for="age${passengerCount}">Age *</label>
                    <input type="number" id="age${passengerCount}" name="age${passengerCount}" min="1" max="120" required placeholder="Age">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="gender${passengerCount}">Gender *</label>
                    <select id="gender${passengerCount}" name="gender${passengerCount}" required>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="berth${passengerCount}">Berth Preference</label>
                    <select id="berth${passengerCount}" name="berth${passengerCount}">
                        <option value="No Preference">No Preference</option>
                        <option value="Lower">Lower</option>
                        <option value="Middle">Middle</option>
                        <option value="Upper">Upper</option>
                        <option value="Side Lower">Side Lower</option>
                        <option value="Side Upper">Side Upper</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', passengerHTML);
    updateTotalAmount();
}

function removePassenger(id) {
    const passenger = document.getElementById(`passenger${id}`);
    if (passenger) {
        passenger.remove();
        passengerCount--;
        updateTotalAmount();
    }
}

function updateTotalAmount() {
    const totalAmountElement = document.getElementById('totalAmount');
    const passengers = document.querySelectorAll('.passenger-details').length;
    const total = selectedTrain ? selectedTrain.price * passengers : 0;
    totalAmountElement.textContent = `₹${total.toLocaleString('en-IN')}`;
}

document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const passengers = [];
    const passengerDivs = document.querySelectorAll('.passenger-details');
    
    passengerDivs.forEach((div) => {
        const nameField = div.querySelector('input[type="text"]');
        const ageField = div.querySelector('input[type="number"]');
        const genderField = div.querySelector('select[name*="gender"]');
        const berthField = div.querySelector('select[name*="berth"]');
        
        if (nameField && ageField && genderField && berthField) {
            passengers.push({
                name: nameField.value,
                age: ageField.value,
                gender: genderField.value,
                berth: berthField.value
            });
        }
    });
    
    if (passengers.length === 0) {
        alert('Please add at least one passenger!');
        return;
    }
    
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    if (!email || !phone) {
        alert('Please enter email and phone number!');
        return;
    }
    
    const bookingData = {
        train_id: selectedTrain.train_id,
        journey_date: selectedTrain.journeyDate,
        passengers: passengers,
        contact_email: email,
        contact_phone: phone
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            sessionStorage.setItem('lastBookingPNR', result.data.pnr_number);
            sessionStorage.removeItem('selectedTrainId');
            sessionStorage.removeItem('journeyDate');
            window.location.href = 'booking-success.html';
        } else {
            alert('Booking failed: ' + result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        alert('Failed to create booking. Please check if the server is running.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

