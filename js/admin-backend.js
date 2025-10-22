const API_BASE_URL = 'php/api';

document.addEventListener('DOMContentLoaded', function() {
    loadTrains();
    updateStatistics();
});

async function loadTrains() {
    const trainsList = document.getElementById('trainsList');
    trainsList.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: #666;">Loading trains...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/trains.php`);
        const result = await response.json();
        
        if (result.success) {
            displayTrains(result.data);
        } else {
            trainsList.innerHTML = `
                <div class="message message-error">
                    Failed to load trains: ${result.message}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading trains:', error);
        trainsList.innerHTML = `
            <div class="message message-error">
                Failed to connect to server.
            </div>
        `;
    }
}

function displayTrains(trains) {
    const trainsList = document.getElementById('trainsList');
    
    if (trains.length === 0) {
        trainsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>No trains found.</p>
            </div>
        `;
        return;
    }
    
    trainsList.innerHTML = '';
    
    trains.forEach((train) => {
        const trainItem = createTrainItem(train);
        trainsList.innerHTML += trainItem;
    });
}

function createTrainItem(train) {
    return `
        <div class="train-item-admin" id="train-${train.train_id}">
            <div>
                <div style="font-weight: bold; color: #1a4d8f; margin-bottom: 5px;">
                    ${train.train_name} (${train.train_number})
                </div>
                <div style="font-size: 14px; color: #666;">
                    ${train.source_station} → ${train.destination_station} | ${train.train_class} | ₹${train.price}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 3px;">
                    Available: ${train.available_seats}/${train.total_seats} seats
                </div>
            </div>
            <div class="train-item-actions">
                <button class="btn btn-secondary btn-small" onclick="editTrain(${train.train_id})">
                    Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteTrain(${train.train_id}, '${train.train_name}')">
                    Delete
                </button>
            </div>
        </div>
    `;
}

document.getElementById('addTrainForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const trainData = {
        train_name: document.getElementById('trainName').value,
        train_number: document.getElementById('trainNumber').value,
        source_station: document.getElementById('trainSource').value,
        destination_station: document.getElementById('trainDestination').value,
        departure_time: document.getElementById('departureTime').value,
        arrival_time: document.getElementById('arrivalTime').value,
        duration: document.getElementById('duration').value,
        train_class: document.getElementById('trainClass').value,
        total_seats: parseInt(document.getElementById('availableSeats').value),
        price: parseFloat(document.getElementById('price').value)
    };
    
    if (trainData.source_station === trainData.destination_station) {
        alert('Source and destination cannot be the same!');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/trains.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trainData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadTrains();
            updateStatistics();
            showMessage('Train added successfully!', 'success');
            
            this.reset();
        } else {
            alert('Failed to add train: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error adding train:', error);
        alert('Failed to add train. Please check if the server is running.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

async function editTrain(trainId) {
    try {
        const response = await fetch(`${API_BASE_URL}/trains.php?id=${trainId}`);
        const result = await response.json();
        
        if (result.success) {
            const train = result.data;
            
            document.getElementById('trainName').value = train.train_name;
            document.getElementById('trainNumber').value = train.train_number;
            document.getElementById('trainSource').value = train.source_station;
            document.getElementById('trainDestination').value = train.destination_station;
            document.getElementById('departureTime').value = train.departure_time;
            document.getElementById('arrivalTime').value = train.arrival_time;
            document.getElementById('duration').value = train.duration;
            document.getElementById('trainClass').value = train.train_class;
            document.getElementById('availableSeats').value = train.total_seats;
            document.getElementById('price').value = train.price;
            
            document.getElementById('addTrainForm').scrollIntoView({ behavior: 'smooth' });
            
            showMessage('Train loaded. Update details and click Add to create new version. Delete the old one after.', 'info');
        }
        
    } catch (error) {
        console.error('Error loading train for edit:', error);
        alert('Failed to load train details.');
    }
}

async function deleteTrain(trainId, trainName) {
    const confirmDelete = confirm(
        `Are you sure you want to delete this train?\n\n${trainName}\n\n` +
        `This action cannot be undone.`
    );
    
    if (!confirmDelete) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/trains.php?id=${trainId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadTrains();
            updateStatistics();
            showMessage('Train deleted successfully!', 'success');
        } else {
            alert('Failed to delete train: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error deleting train:', error);
        alert('Failed to delete train. Please check if the server is running.');
    }
}

async function updateStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/statistics.php`);
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data.summary;
            
            document.getElementById('totalTrains').textContent = stats.total_trains || 0;
            document.getElementById('totalBookings').textContent = stats.total_bookings || 0;
            document.getElementById('confirmedBookings').textContent = stats.confirmed_bookings || 0;
            document.getElementById('cancelledBookings').textContent = stats.cancelled_bookings || 0;
        }
        
    } catch (error) {
        console.error('Error loading statistics:', error);
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

