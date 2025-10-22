const trainsDatabase = [
    {
        id: 1,
        name: "Rajdhani Express",
        number: "12301",
        source: "Delhi",
        destination: "Mumbai",
        departureTime: "16:55",
        arrivalTime: "08:35",
        duration: "15h 40m",
        availableSeats: 45,
        price: 1850,
        class: "AC 2 Tier"
    },
    {
        id: 2,
        name: "Shatabdi Express",
        number: "12002",
        source: "Delhi",
        destination: "Jaipur",
        departureTime: "06:05",
        arrivalTime: "10:30",
        duration: "4h 25m",
        availableSeats: 32,
        price: 780,
        class: "AC 1 Tier"
    },
    {
        id: 3,
        name: "Duronto Express",
        number: "12259",
        source: "Mumbai",
        destination: "Delhi",
        departureTime: "22:25",
        arrivalTime: "12:40",
        duration: "14h 15m",
        availableSeats: 58,
        price: 1650,
        class: "AC 3 Tier"
    },
    {
        id: 4,
        name: "Chennai Express",
        number: "12163",
        source: "Chennai",
        destination: "Bangalore",
        departureTime: "07:00",
        arrivalTime: "12:30",
        duration: "5h 30m",
        availableSeats: 40,
        price: 650,
        class: "Sleeper"
    },
    {
        id: 5,
        name: "Howrah Mail",
        number: "12321",
        source: "Kolkata",
        destination: "Delhi",
        departureTime: "14:35",
        arrivalTime: "10:15",
        duration: "19h 40m",
        availableSeats: 25,
        price: 1420,
        class: "AC 2 Tier"
    },
    {
        id: 6,
        name: "Bangalore Rajdhani",
        number: "12430",
        source: "Delhi",
        destination: "Bangalore",
        departureTime: "20:00",
        arrivalTime: "06:10",
        duration: "34h 10m",
        availableSeats: 52,
        price: 2450,
        class: "AC 1 Tier"
    },
    {
        id: 7,
        name: "Gujarat Express",
        number: "12901",
        source: "Delhi",
        destination: "Ahmedabad",
        departureTime: "09:40",
        arrivalTime: "21:15",
        duration: "11h 35m",
        availableSeats: 38,
        price: 980,
        class: "AC 3 Tier"
    },
    {
        id: 8,
        name: "Deccan Queen",
        number: "12123",
        source: "Mumbai",
        destination: "Pune",
        departureTime: "17:10",
        arrivalTime: "20:25",
        duration: "3h 15m",
        availableSeats: 62,
        price: 420,
        class: "Sleeper"
    },
    {
        id: 9,
        name: "Hyderabad Express",
        number: "12759",
        source: "Hyderabad",
        destination: "Chennai",
        departureTime: "18:55",
        arrivalTime: "06:30",
        duration: "11h 35m",
        availableSeats: 44,
        price: 890,
        class: "AC 2 Tier"
    },
    {
        id: 10,
        name: "Lucknow Mail",
        number: "12229",
        source: "Delhi",
        destination: "Lucknow",
        departureTime: "23:00",
        arrivalTime: "07:15",
        duration: "8h 15m",
        availableSeats: 36,
        price: 740,
        class: "Sleeper"
    },
    {
        id: 11,
        name: "Mumbai Duronto",
        number: "12263",
        source: "Mumbai",
        destination: "Bangalore",
        departureTime: "11:45",
        arrivalTime: "11:50",
        duration: "24h 5m",
        availableSeats: 48,
        price: 1880,
        class: "AC 3 Tier"
    },
    {
        id: 12,
        name: "Chennai Rajdhani",
        number: "12433",
        source: "Delhi",
        destination: "Chennai",
        departureTime: "15:55",
        arrivalTime: "09:00",
        duration: "28h 5m",
        availableSeats: 29,
        price: 2180,
        class: "AC 2 Tier"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;

    loadCustomTrains();
});

function loadCustomTrains() {
    const customTrains = localStorage.getItem('customTrains');
    if (customTrains) {
        const trains = JSON.parse(customTrains);
        trainsDatabase.push(...trains);
    }
}

function swapStations() {
    const source = document.getElementById('source');
    const destination = document.getElementById('destination');
    
    const temp = source.value;
    source.value = destination.value;
    destination.value = temp;
}

document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const trainClass = document.getElementById('class').value;
    
    if (source === destination) {
        alert('Source and destination cannot be the same!');
        return;
    }
    
    let results = trainsDatabase.filter(train => {
        const matchesRoute = train.source === source && train.destination === destination;
        const matchesClass = trainClass === 'All' || train.class === trainClass;
        return matchesRoute && matchesClass;
    });
    
    displayResults(results, source, destination, date);
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
                    <div class="train-name">${train.name}</div>
                    <div class="train-number">#${train.number}</div>
                </div>
                <div class="available-seats">
                    ${train.availableSeats} seats available
                </div>
            </div>
            
            <div class="train-details">
                <div class="station-info">
                    <div class="station-name">${train.source}</div>
                    <div class="station-time">${train.departureTime}</div>
                </div>
                
                <div class="arrow">→</div>
                
                <div class="duration">${train.duration}</div>
                
                <div class="arrow">→</div>
                
                <div class="station-info">
                    <div class="station-name">${train.destination}</div>
                    <div class="station-time">${train.arrivalTime}</div>
                </div>
            </div>
            
            <div class="train-footer">
                <div>
                    <div class="price">₹${train.price}</div>
                    <div style="font-size: 14px; color: #666;">${train.class}</div>
                </div>
                <button class="btn btn-primary" onclick="bookTrain(${train.id}, '${date}')">
                    Book Now
                </button>
            </div>
        </div>
    `;
}

function bookTrain(trainId, date) {
    const train = trainsDatabase.find(t => t.id === trainId);
    
    if (!train) {
        alert('Train not found!');
        return;
    }
    
    sessionStorage.setItem('selectedTrain', JSON.stringify({
        ...train,
        journeyDate: date
    }));
    
    window.location.href = 'booking.html';
}

