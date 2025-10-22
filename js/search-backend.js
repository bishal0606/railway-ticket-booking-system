const API_BASE_URL = 'php/api';

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
});

function swapStations() {
    const source = document.getElementById('source');
    const destination = document.getElementById('destination');
    
    const temp = source.value;
    source.value = destination.value;
    destination.value = temp;
}

document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const trainClass = document.getElementById('class').value;
    
    if (source === destination) {
        alert('Source and destination cannot be the same!');
        return;
    }
    
    showLoading();
    
    try {
        let url = `${API_BASE_URL}/trains.php?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`;
        
        if (trainClass !== 'All') {
            url += `&class=${encodeURIComponent(trainClass)}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        hideLoading();
        
        if (result.success) {
            displayResults(result.data, source, destination, date);
        } else {
            alert('Error: ' + result.message);
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error fetching trains:', error);
        alert('Failed to search trains. Please check if the server is running.');
    }
});

function displayResults(trains, source, destination, date) {
    const resultsSection = document.getElementById('resultsSection');
    const trainsList = document.getElementById('trainsList');
    
    trainsList.innerHTML = '';
    
    if (trains.length === 0) {
        trainsList.innerHTML = `
            <div class="no-results">
                <h3>No trains found</h3>
                <p>Sorry, no trains are available from ${source} to ${destination}.</p>
                <p>Please try different stations or dates.</p>
            </div>
        `;
        resultsSection.classList.remove('hidden');
        return;
    }
    
    trains.forEach(train => {
        const trainCard = createTrainCard(train, date);
        trainsList.innerHTML += trainCard;
    });
    
    resultsSection.classList.remove('hidden');
    
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createTrainCard(train, date) {
    return `
        <div class="train-card fade-in">
            <div class="train-header">
                <div>
                    <div class="train-name">${train.train_name}</div>
                    <div class="train-number">#${train.train_number}</div>
                </div>
                <div class="available-seats">
                    ${train.available_seats} seats available
                </div>
            </div>
            
            <div class="train-details">
                <div class="station-info">
                    <div class="station-name">${train.source_station}</div>
                    <div class="station-time">${train.departure_time}</div>
                </div>
                
                <div class="arrow">→</div>
                
                <div class="duration">${train.duration}</div>
                
                <div class="arrow">→</div>
                
                <div class="station-info">
                    <div class="station-name">${train.destination_station}</div>
                    <div class="station-time">${train.arrival_time}</div>
                </div>
            </div>
            
            <div class="train-footer">
                <div>
                    <div class="price">₹${train.price}</div>
                    <div style="font-size: 14px; color: #666;">${train.train_class}</div>
                </div>
                <button class="btn btn-primary" onclick="bookTrain(${train.train_id}, '${date}', ${train.available_seats})">
                    Book Now
                </button>
            </div>
        </div>
    `;
}

function bookTrain(trainId, date, availableSeats) {
    if (availableSeats === 0) {
        alert('Sorry, no seats available on this train!');
        return;
    }
    
    sessionStorage.setItem('selectedTrainId', trainId);
    sessionStorage.setItem('journeyDate', date);
    
    window.location.href = 'booking.html';
}

function showLoading() {
    const trainsList = document.getElementById('trainsList');
    trainsList.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: #666;">Searching trains...</p>';
    document.getElementById('resultsSection').classList.remove('hidden');
}

function hideLoading() {
}

