const API_BASE_URL = 'php/api';

document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
});

async function loadBookings() {
    const container = document.getElementById('bookingsContainer');
    container.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: #666;">Loading bookings...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings.php`);
        const result = await response.json();
        
        if (result.success) {
            displayBookings(result.data);
        } else {
            container.innerHTML = `
                <div class="message message-error">
                    Failed to load bookings: ${result.message}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = `
            <div class="message message-error">
                Failed to connect to server. Please check if the backend is running.
            </div>
        `;
    }
}

function displayBookings(bookings) {
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
    
    container.innerHTML = '';
    
    bookings.forEach((booking, index) => {
        const bookingCard = createBookingCard(booking, index);
        container.innerHTML += bookingCard;
    });
}

function createBookingCard(booking, index) {
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const journeyDate = new Date(booking.journey_date).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const statusClass = booking.booking_status === 'Confirmed' ? 'booking-status' : 'booking-status';
    const statusStyle = booking.booking_status === 'Cancelled' ? 'background: #dc3545;' : '';
    
    let passengersHTML = '';
    if (booking.passengers && Array.isArray(booking.passengers)) {
        passengersHTML = booking.passengers.map((passenger, idx) => `
            <div style="background: #e6f0ff; padding: 10px 15px; border-radius: 6px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                <span><strong>Passenger ${idx + 1}:</strong> ${passenger.full_name}</span>
                <span>${passenger.age} yrs, ${passenger.gender}, ${passenger.berth_preference}</span>
            </div>
        `).join('');
    }
    
    return `
        <div class="booking-item fade-in" id="booking-${booking.booking_id}">
            <div class="booking-header">
                <div class="booking-id">PNR: ${booking.pnr_number}</div>
                <div class="${statusClass}" style="${statusStyle}">${booking.booking_status}</div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="color: #1a4d8f; margin-bottom: 15px;">
                    ${booking.train_name || 'Unknown Train'} (${booking.train_number || 'N/A'})
                </h3>
                
                <div class="booking-details">
                    <div class="detail-item">
                        <strong>From:</strong> ${booking.source_station || 'N/A'}<br>
                        <span style="color: #666;">${booking.departure_time || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>To:</strong> ${booking.destination_station || 'N/A'}<br>
                        <span style="color: #666;">${booking.arrival_time || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Journey Date:</strong><br>
                        ${journeyDate}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
                    <div class="detail-item">
                        <strong>Class:</strong> ${booking.train_class || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Passengers:</strong> ${booking.total_passengers}
                    </div>
                    <div class="detail-item">
                        <strong>Total Amount:</strong> <span style="color: #28a745; font-weight: bold;">₹${parseFloat(booking.total_amount).toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #1a4d8f; margin-bottom: 10px;">Passenger Details:</h4>
                ${passengersHTML}
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <div style="font-size: 14px; color: #666;">
                    Booked on: ${bookingDate}
                </div>
                ${booking.booking_status === 'Confirmed' ? `
                    <button class="btn btn-danger" onclick="cancelBooking(${booking.booking_id}, '${booking.pnr_number}')">
                        Cancel Booking
                    </button>
                ` : `
                    <span style="color: #dc3545; font-weight: 600;">Booking Cancelled</span>
                `}
            </div>
        </div>
    `;
}

async function cancelBooking(bookingId, pnr) {
    const confirmCancel = confirm(
        `Are you sure you want to cancel this booking?\n\n` +
        `PNR: ${pnr}\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmCancel) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings.php?id=${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'Cancelled'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadBookings();
            showMessage('Booking cancelled successfully!', 'success');
        } else {
            alert('Failed to cancel booking: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please check if the server is running.');
    }
}

function showMessage(message, type) {
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

