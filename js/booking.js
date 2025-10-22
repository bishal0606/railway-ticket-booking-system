
let selectedTrain = null;
let passengerCount = 1;
const maxPassengers = 4;

document.addEventListener('DOMContentLoaded', function() {
    loadTrainDetails();
    updateTotalAmount();
});

function loadTrainDetails() {
    const trainData = sessionStorage.getItem('selectedTrain');
    
    if (!trainData) {
        alert('No train selected! Redirecting to search page...');
        window.location.href = 'search.html';
        return;
    }
    
    selectedTrain = JSON.parse(trainData);
    displayTrainSummary();
}

function displayTrainSummary() {
    const summaryDiv = document.getElementById('trainSummary');
    
    summaryDiv.innerHTML = `
        <h3 style="color: #1a4d8f; margin-bottom: 15px;">Journey Details</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
            <div>
                <strong>Train:</strong> ${selectedTrain.name} (${selectedTrain.number})
            </div>
            <div>
                <strong>Class:</strong> ${selectedTrain.class}
            </div>
            <div>
                <strong>From:</strong> ${selectedTrain.source}
            </div>
            <div>
                <strong>To:</strong> ${selectedTrain.destination}
            </div>
            <div>
                <strong>Departure:</strong> ${selectedTrain.departureTime}
            </div>
            <div>
                <strong>Arrival:</strong> ${selectedTrain.arrivalTime}
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
                <strong>Available Seats:</strong> ${selectedTrain.availableSeats}
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

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const passengers = [];
    const passengerDivs = document.querySelectorAll('.passenger-details');
    
    passengerDivs.forEach((div, index) => {
        const num = index + 1;
        passengers.push({
            name: document.getElementById(`name${num}`).value,
            age: document.getElementById(`age${num}`).value,
            gender: document.getElementById(`gender${num}`).value,
            berth: document.getElementById(`berth${num}`).value
        });
    });
    
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    
    const booking = {
        bookingId: 'PNR' + Date.now(),
        train: selectedTrain,
        passengers: passengers,
        contact: {
            email: email,
            phone: phone
        },
        bookingDate: new Date().toISOString(),
        totalAmount: selectedTrain.price * passengers.length,
        status: 'Confirmed'
    };
    
    saveBooking(booking);
    
    showSuccessMessage(booking.bookingId);
});

function saveBooking(booking) {
    let bookings = localStorage.getItem('bookings');
    bookings = bookings ? JSON.parse(bookings) : [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function showSuccessMessage(bookingId) {
    const container = document.querySelector('.booking-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 80px; color: #28a745; margin-bottom: 20px;">✓</div>
            <h1 style="color: #28a745; margin-bottom: 15px;">Ticket Successfully Booked!</h1>
            <p style="font-size: 20px; color: #666; margin-bottom: 30px;">
                Your booking has been confirmed
            </p>
            <div style="background: #e6f0ff; padding: 30px; border-radius: 12px; max-width: 500px; margin: 0 auto 30px;">
                <h3 style="color: #1a4d8f; margin-bottom: 10px;">Booking ID (PNR)</h3>
                <h2 style="color: #ff6b35; font-size: 32px;">${bookingId}</h2>
                <p style="color: #666; margin-top: 15px;">Please save this PNR for future reference</p>
            </div>
            <div style="margin-top: 40px;">
                <a href="bookings.html" class="btn btn-primary">View My Bookings</a>
                <a href="search.html" class="btn btn-secondary" style="margin-left: 15px;">Book Another Ticket</a>
            </div>
        </div>
    `;
    
    sessionStorage.removeItem('selectedTrain');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

