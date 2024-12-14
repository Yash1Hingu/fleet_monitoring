import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Include Leaflet's CSS

const App = () => {
    const [robots, setRobots] = useState([]);
    const [filteredRobots, setFilteredRobots] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all'); // Filter by 'all', 'online', 'offline', 'low-battery'
    const [batteryFilter, setBatteryFilter] = useState('all'); // Filter by 'all', 'low', 'high'
    const [selectedRobot, setSelectedRobot] = useState(null); // Track the selected robot
    const [userInteracted, setUserInteracted] = useState(false); // Track if the user has interacted with the map

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/robots')
            .then(res => {
                setRobots(res.data);
                setFilteredRobots(res.data);
            })
            .catch(err => console.error(err));

        const ws = new WebSocket('ws://127.0.0.1:8000/ws/updates');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setRobots(data);
            filterRobots(data);
        };

        return () => {
            ws.close();
        };
    }, [statusFilter, batteryFilter]);

    const filterRobots = (robotsData) => {
        let filtered = robotsData;

        if (statusFilter === 'online') {
            filtered = filtered.filter(robot => robot.online);
        } else if (statusFilter === 'offline') {
            filtered = filtered.filter(robot => !robot.online);
        }

        if (batteryFilter === 'low') {
            filtered = filtered.filter(robot => robot.battery < 20);
        } else if (batteryFilter === 'high') {
            filtered = filtered.filter(robot => robot.battery >= 20);
        }

        setFilteredRobots(filtered);
    };

    const RobotMap = () => {
        const map = useMap();

        useEffect(() => {
            if (selectedRobot && !userInteracted) {
                const { location } = selectedRobot;
                map.setView(location, 12, { animate: true }); // Center map on the selected robot's location
            }
        }, [selectedRobot, map, userInteracted]);

        // Track user interactions with the map
        useEffect(() => {
            const handleUserInteraction = () => setUserInteracted(true);

            map.on('movestart', handleUserInteraction);
            map.on('zoomstart', handleUserInteraction);

            return () => {
                map.off('movestart', handleUserInteraction);
                map.off('zoomstart', handleUserInteraction);
            };
        }, [map]);

        return (
            <>
                {filteredRobots.map((robot) => (
                    <Marker key={robot.id} position={robot.location}>
                        <Popup>
                            <b>Robot ID:</b> {robot.id} <br />
                            <b>Status:</b> {robot.online ? 'Online' : 'Offline'} <br />
                            <b>Battery:</b> {robot.battery}%
                        </Popup>
                    </Marker>
                ))}
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex flex-col space-y-6">
            <h1 className="text-3xl font-bold text-center text-blue-600">Fleet Monitoring Dashboard</h1>

            <div className="flex-1 flex space-x-6">
                {/* Left Sidebar (Robot List) */}
                <div className="w-1/3 bg-white shadow-lg border border-gray-200 rounded-lg p-4">
                    {/* Filter Options */}
                    <div className="mb-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full mb-2 px-4 py-2 border rounded-md"
                        >
                            <option value="all">All Status</option>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                        <select
                            value={batteryFilter}
                            onChange={(e) => setBatteryFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md"
                        >
                            <option value="all">All Battery Levels</option>
                            <option value="low">Low Battery</option>
                            <option value="high">High Battery</option>
                        </select>
                    </div>

                    {/* Robot List */}
                    <div className="max-h-[500px] overflow-y-scroll">
                        <table className="w-full bg-white text-sm">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Robot ID</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Battery (%)</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">CPU Usage (%)</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">RAM (MB)</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Last Updated</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRobots.map((robot, index) => (
                                    <tr
                                        key={index}
                                        className={`cursor-pointer ${!robot.online ? 'bg-yellow-200' : ''} border-b hover:bg-gray-100`}
                                        onClick={() => {
                                            setSelectedRobot(robot);
                                            setUserInteracted(false); // Allow zoom on selection
                                        }}
                                    >
                                        <td className="px-4 py-2 text-sm text-gray-700">{robot.id}</td>
                                        <td className={`px-4 py-2 text-sm ${robot.online ? 'text-green-600' : 'text-red-600'}`}>
                                            {robot.online ? 'Online' : 'Offline'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{robot.battery}%</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{robot.cpu}%</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{robot.ram} MB</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{new Date(robot.last_updated).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{robot.location.join(', ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar (Map View) */}
                <div className="flex-1 bg-white shadow-lg border border-gray-200 rounded-lg">
                    <MapContainer
                        center={[0, 0]}
                        zoom={2}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <RobotMap />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default App;
