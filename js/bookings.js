
let bookings = [];

document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    displayBookings();
});

function loadBookings() {
    const storedBookings = localStorage.getItem('bookings');
    bookings = storedBookings ? JSON.parse(storedBookings) : [];
}

function displayBookings() {
    const container = document.getElementById('bookingsContainer');
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No bookings found</h3>
                <p>You haven't made any bookings yet.</p>
                <a href="search.html" class="btn btn-primary" style="margin-top: 20px;">Search Trains</a>
            </div>
        `;
        return;
    }
    
    bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    
    container.innerHTML = '';
    
    bookings.forEach((booking, index) => {
        const bookingCard = createBookingCard(booking, index);
        container.innerHTML += bookingCard;
    });
}

function createBookingCard(booking, index) {
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const journeyDate = new Date(booking.train.journeyDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const statusClass = booking.status === 'Confirmed' ? 'booking-status' : 'booking-status' ;
    const statusStyle = booking.status === 'Cancelled' ? 'background: #dc3545;' : '';
    
    return `
        <div class="booking-item fade-in" id="booking-${index}">
            <div class="booking-header">
                <div class="booking-id">PNR: ${booking.bookingId}</div>
                <div class="${statusClass}" style="${statusStyle}">${booking.status}</div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="color: #1a4d8f; margin-bottom: 15px;">
                    ${booking.train.name} (${booking.train.number})
                </h3>
                
                <div class="booking-details">
                    <div class="detail-item">
                        <strong>From:</strong> ${booking.train.source}<br>
                        <span style="color: #666;">${booking.train.departureTime}</span>
                    </div>
                    <div class="detail-item">
                        <strong>To:</strong> ${booking.train.destination}<br>
                        <span style="color: #666;">${booking.train.arrivalTime}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Journey Date:</strong><br>
                        ${journeyDate}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
                    <div class="detail-item">
                        <strong>Class:</strong> ${booking.train.class}
                    </div>
                    <div class="detail-item">
                        <strong>Passengers:</strong> ${booking.passengers.length}
                    </div>
                    <div class="detail-item">
                        <strong>Total Amount:</strong> <span style="color: #28a745; font-weight: bold;">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #1a4d8f; margin-bottom: 10px;">Passenger Details:</h4>
                ${booking.passengers.map((passenger, idx) => `
                    <div style="background: #e6f0ff; padding: 10px 15px; border-radius: 6px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                        <span><strong>Passenger ${idx + 1}:</strong> ${passenger.name}</span>
                        <span>${passenger.age} yrs, ${passenger.gender}, ${passenger.berth}</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <div style="font-size: 14px; color: #666;">
                    Booked on: ${bookingDate}
                </div>
                ${booking.status === 'Confirmed' ? `
                    <button class="btn btn-danger" onclick="cancelBooking(${index})">
                        Cancel Booking
                    </button>
                ` : `
                    <span style="color: #dc3545; font-weight: 600;">Booking Cancelled</span>
                `}
            </div>
        </div>
    `;
}

function cancelBooking(index) {
    const booking = bookings[index];
    
    const confirmCancel = confirm(
        `Are you sure you want to cancel this booking?\n\n` +
        `PNR: ${booking.bookingId}\n` +
        `Train: ${booking.train.name}\n` +
        `Passengers: ${booking.passengers.length}\n` +
        `Amount: ₹${booking.totalAmount}`
    );
    
    if (!confirmCancel) {
        return;
    }
    
    bookings[index].status = 'Cancelled';
    
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    const bookingElement = document.getElementById(`booking-${index}`);
    bookingElement.style.opacity = '0';
    bookingElement.style.transform = 'translateX(-20px)';
    bookingElement.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        displayBookings();
        showMessage('Booking cancelled successfully!', 'success');
    }, 300);
}

function showMessage(message, type) {
    const container = document.getElementById('bookingsContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

