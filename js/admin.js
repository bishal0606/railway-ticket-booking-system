
let customTrains = [];
let nextTrainId = 1000;

document.addEventListener('DOMContentLoaded', function() {
    loadCustomTrains();
    displayTrains();
    updateStatistics();
});

function loadCustomTrains() {
    const stored = localStorage.getItem('customTrains');
    customTrains = stored ? JSON.parse(stored) : [];
    
    if (customTrains.length > 0) {
        const maxId = Math.max(...customTrains.map(t => t.id));
        nextTrainId = maxId + 1;
    }
}

function saveCustomTrains() {
    localStorage.setItem('customTrains', JSON.stringify(customTrains));
}

function displayTrains() {
    const trainsList = document.getElementById('trainsList');
    
    if (customTrains.length === 0) {
        trainsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>No custom trains added yet.</p>
                <p style="font-size: 14px; margin-top: 10px;">Use the form to add new trains to the system.</p>
            </div>
        `;
        return;
    }
    
    trainsList.innerHTML = '';
    
    customTrains.forEach((train, index) => {
        const trainItem = createTrainItem(train, index);
        trainsList.innerHTML += trainItem;
    });
}

function createTrainItem(train, index) {
    return `
        <div class="train-item-admin" id="train-${index}">
            <div>
                <div style="font-weight: bold; color: #1a4d8f; margin-bottom: 5px;">
                    ${train.name} (${train.number})
                </div>
                <div style="font-size: 14px; color: #666;">
                    ${train.source} → ${train.destination} | ${train.class} | ₹${train.price}
                </div>
            </div>
            <div class="train-item-actions">
                <button class="btn btn-secondary btn-small" onclick="editTrain(${index})">
                    Edit
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteTrain(${index})">
                    Delete
                </button>
            </div>
        </div>
    `;
}

document.getElementById('addTrainForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const trainData = {
        id: nextTrainId++,
        name: document.getElementById('trainName').value,
        number: document.getElementById('trainNumber').value,
        source: document.getElementById('trainSource').value,
        destination: document.getElementById('trainDestination').value,
        departureTime: document.getElementById('departureTime').value,
        arrivalTime: document.getElementById('arrivalTime').value,
        duration: document.getElementById('duration').value,
        class: document.getElementById('trainClass').value,
        availableSeats: parseInt(document.getElementById('availableSeats').value),
        price: parseInt(document.getElementById('price').value)
    };
    
    if (trainData.source === trainData.destination) {
        alert('Source and destination cannot be the same!');
        return;
    }
    
    customTrains.push(trainData);
    
    saveCustomTrains();
    
    displayTrains();
    updateStatistics();
    
    showMessage('Train added successfully!', 'success');
    
    this.reset();
});

function editTrain(index) {
    const train = customTrains[index];
    
    document.getElementById('trainName').value = train.name;
    document.getElementById('trainNumber').value = train.number;
    document.getElementById('trainSource').value = train.source;
    document.getElementById('trainDestination').value = train.destination;
    document.getElementById('departureTime').value = train.departureTime;
    document.getElementById('arrivalTime').value = train.arrivalTime;
    document.getElementById('duration').value = train.duration;
    document.getElementById('trainClass').value = train.class;
    document.getElementById('availableSeats').value = train.availableSeats;
    document.getElementById('price').value = train.price;
    
    customTrains.splice(index, 1);
    saveCustomTrains();
    displayTrains();
    updateStatistics();
    
    document.getElementById('addTrainForm').scrollIntoView({ behavior: 'smooth' });
    
    showMessage('Train loaded for editing. Update details and click Add Train.', 'info');
}

function deleteTrain(index) {
    const train = customTrains[index];
    
    const confirmDelete = confirm(
        `Are you sure you want to delete this train?\n\n` +
        `${train.name} (${train.number})\n` +
        `${train.source} → ${train.destination}`
    );
    
    if (!confirmDelete) {
        return;
    }
    
    customTrains.splice(index, 1);
    
    saveCustomTrains();
    
    const trainElement = document.getElementById(`train-${index}`);
    trainElement.style.opacity = '0';
    trainElement.style.transform = 'translateX(-20px)';
    trainElement.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        displayTrains();
        updateStatistics();
        showMessage('Train deleted successfully!', 'success');
    }, 300);
}

function updateStatistics() {
    const totalTrains = 12 + customTrains.length; // 12 is default trains count
    document.getElementById('totalTrains').textContent = totalTrains;
    
    const bookings = localStorage.getItem('bookings');
    const bookingsArray = bookings ? JSON.parse(bookings) : [];
    
    const totalBookings = bookingsArray.length;
    const confirmedBookings = bookingsArray.filter(b => b.status === 'Confirmed').length;
    const cancelledBookings = bookingsArray.filter(b => b.status === 'Cancelled').length;
    
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('confirmedBookings').textContent = confirmedBookings;
    document.getElementById('cancelledBookings').textContent = cancelledBookings;
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

