
    let map = null;
        let marker = null;
        function updateBatteryLevel(level) {
            const batteryLevel = document.getElementById('battery-level');
            const batteryValue = document.getElementById('battery-level-value');

            // Set battery level percentage
            batteryLevel.style.width = `${level}%`;

            // Change color based on battery level
            if (level > 50) {
                batteryLevel.style.backgroundColor = 'green';
            } else if (level > 20) {
                batteryLevel.style.backgroundColor = 'orange';
            } else {
                batteryLevel.style.backgroundColor = 'red';
            }

            // Update battery value text
            batteryValue.textContent = `${level}%`;
        }

        // Example usage: Update battery level to 75%
        
        const initMap = () => {
            if (!map) {
                map = L.map('map').setView([0, 0], 2); // Default global view
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
            }
        };

        // Update Map Location
        const updateMap = (latitude, longitude) => {
            if (!map) return;
            const coords = [latitude, longitude];
            if (!marker) {
                marker = L.marker(coords).addTo(map);
            } else {
                marker.setLatLng(coords);
            }
            map.setView(coords, 13);
            document.getElementById('location-coordinates').textContent = `Coordinates: ${latitude}, ${longitude}`;
        };

        // Fetch and Update Data
        const fetchData = async () => {
            try {
                const response = await fetch("https://eu1.cloud.thethings.network/api/v3/as/applications/lora-20245/packages/storage/uplink_message", {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer NNSXS.GWOIHRXZFTMMBAZIZDGQ26RMPNU6UGJTPIZU5QY.ZDGZRNEJQQGPP2WCCJCR3XNIHDGVY776O3VZ5JAFWBZ7TTCPYYGA',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

                const rawData = await response.text();
                const jsonObjects = rawData.split('\n').filter(line => line.trim() !== '');
                const lastMessage = JSON.parse(jsonObjects[jsonObjects.length - 1]);
                const payload = lastMessage.result.uplink_message.decoded_payload;

                updateUI(payload);
                updateTimestamp();  // Update timestamp on each data fetch
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const updateUI = (data) => {
            if (data.device_addr) document.getElementById('device-id').textContent = data.device_addr;
            if (data.bin_level) document.getElementById('bin-level-value').textContent = data.bin_level;
            if (data.battery_level) document.getElementById('battery-level-value').textContent = data.battery_level;
            if (data.distance) document.getElementById('distance-value').textContent = data.distance;
            if (data.temperature) document.getElementById('temperature-value').textContent = `${data.temperature}°C`;
            if (data.positionState) document.getElementById('device_position_state').textContent = `${data.positionState}`;
            updateBatteryLevel(data.battery_level);
            // Update Map Location
            if (data.latitude && data.longitude) {
                updateMap(data.latitude, data.longitude);
            }
        };
        const updateTimestamp = () => {
            const now = new Date();
            const timestamp = now.toLocaleString();  // This will format the date/time based on the user's locale
            document.getElementById('last-update-time').textContent = `Last update: ${timestamp}`;
        };
        // Initialize Map and Fetch Data
        initMap();
        document.querySelector('script[src="assets/index.js"]').textContent.includes('initMap')
        setInterval(fetchData, 10000);
        fetchData();
