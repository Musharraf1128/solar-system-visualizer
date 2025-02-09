import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Base sizes
const BASE_PLANET_SIZE = 5.25;
const SUN_SIZE = BASE_PLANET_SIZE * 5;

// Complete planet data with orbital parameters
const PLANETS = [
    { name: 'Mercury', size: BASE_PLANET_SIZE * 0.6, distance: 80, color: 0x888888, period: 88, inclination: 7.0, eccentricity: 0.206 },
    { name: 'Venus', size: BASE_PLANET_SIZE * 0.9, distance: 120, color: 0xe39e1c, period: 225, inclination: 3.4, eccentricity: 0.007 },
    { name: 'Earth', size: BASE_PLANET_SIZE * 1.0, distance: 160, color: 0x6b93d6, period: 365, inclination: 0.0, eccentricity: 0.017 },
    { name: 'Mars', size: BASE_PLANET_SIZE * 0.7, distance: 200, color: 0xc1440e, period: 687, inclination: 1.9, eccentricity: 0.093 },
    { name: 'Jupiter', size: BASE_PLANET_SIZE * 2.2, distance: 280, color: 0xd8ca9d, period: 4333, inclination: 1.3, eccentricity: 0.048 },
    { name: 'Saturn', size: BASE_PLANET_SIZE * 2.0, distance: 360, color: 0xead6b8, period: 10759, inclination: 2.5, eccentricity: 0.054 },
    { name: 'Uranus', size: BASE_PLANET_SIZE * 1.4, distance: 440, color: 0xc3d4d2, period: 30687, inclination: 0.8, eccentricity: 0.047 },
    { name: 'Neptune', size: BASE_PLANET_SIZE * 1.4, distance: 520, color: 0x5b5ddf, period: 60190, inclination: 1.8, eccentricity: 0.009 }
];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 3000;
controls.minDistance = 50;
controls.zoomSpeed = 1.5;

// Zoom controls UI
const zoomControls = document.createElement('div');
zoomControls.style.position = 'absolute';
zoomControls.style.bottom = '20px';
zoomControls.style.right = '20px';
zoomControls.style.zIndex = '1000';

const zoomInBtn = document.createElement('button');
zoomInBtn.innerHTML = '➕';
zoomInBtn.style.padding = '10px 15px';
zoomInBtn.style.marginRight = '10px';
zoomInBtn.style.cursor = 'pointer';
zoomInBtn.style.backgroundColor = '#333';
zoomInBtn.style.color = 'white';
zoomInBtn.style.border = 'none';
zoomInBtn.style.borderRadius = '5px';

const zoomOutBtn = document.createElement('button');
zoomOutBtn.innerHTML = '➖';
zoomOutBtn.style.padding = '10px 15px';
zoomOutBtn.style.cursor = 'pointer';
zoomOutBtn.style.backgroundColor = '#333';
zoomOutBtn.style.color = 'white';
zoomOutBtn.style.border = 'none';
zoomOutBtn.style.borderRadius = '5px';

zoomControls.appendChild(zoomInBtn);
zoomControls.appendChild(zoomOutBtn);
document.body.appendChild(zoomControls);

zoomInBtn.addEventListener('click', () => camera.position.multiplyScalar(0.8));
zoomOutBtn.addEventListener('click', () => camera.position.multiplyScalar(1.2));

// Create sun with glow effect
const sunGeometry = new THREE.SphereGeometry(SUN_SIZE, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffdd00,
    transparent: true
});

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create sun glow
const spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oHGQYvFhEQd0sAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAMklEQVQI12NkYGD4z4AG/v//z8gAAQxQBf9hNFwCJohiAFwSRQG6SZKQ0cwwmYH9MBoA+/8PCS9sJqEAAAAASUVORK5CYII='),
    color: 0xffdd00,
    transparent: true,
    blending: THREE.AdditiveBlending
});

const sunGlow = new THREE.Sprite(spriteMaterial);
sunGlow.scale.set(SUN_SIZE * 4, SUN_SIZE * 4, 1);
sun.add(sunGlow);

// Create elliptical orbit lines
// Create elliptical orbit lines
function createOrbit(radius, eccentricity, inclination) {
    const segments = 256;
    const orbitGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * 3);
    const opacities = new Float32Array(segments + 1);
    
    const semiMajor = radius;
    const semiMinor = radius * Math.sqrt(1 - eccentricity * eccentricity);
    
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * semiMajor;
        const z = Math.sin(angle) * semiMinor;
        
        // Apply inclination rotation
        const incRad = (inclination * Math.PI) / 180;
        const rotatedZ = z * Math.cos(incRad) - 0 * Math.sin(incRad);
        const y = z * Math.sin(incRad) + 0 * Math.cos(incRad);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = rotatedZ;
        
        opacities[i] = 1.0;
    }
    
    orbitGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    orbitGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    
    const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00FFFF,  // Cyan color for better visibility on black background
        transparent: false,
        opacity: 0.7,      // You can adjust the opacity as needed
        vertexColors: true
    });
    
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.userData.opacities = opacities;
    return orbit;
}


// Watermark
const watermark = document.createElement('div');
watermark.style.position = 'absolute';
watermark.style.bottom = '10px';
watermark.style.left = '10px';
watermark.style.color = 'rgba(255, 255, 255, 0.5)';
watermark.style.fontFamily = 'Arial, sans-serif';
watermark.style.fontSize = '14px';
watermark.style.zIndex = '1000';
watermark.textContent = 'by Musharraf';
document.body.appendChild(watermark);

// Create planets
const planetObjects = PLANETS.map(planetData => {
    const geometry = new THREE.SphereGeometry(planetData.size, 24, 24);
    const material = new THREE.MeshPhongMaterial({
        color: planetData.color,
        shininess: 10,
        wireframe: false
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    
    const orbit = createOrbit(planetData.distance, planetData.eccentricity, planetData.inclination);
    scene.add(orbit);
    scene.add(planet);
    
    return { planet, orbit, data: planetData };
});

// Create background stars
function addStars() {
    const createStarLayer = (count, minDist, maxDist) => {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const distance = minDist + Math.random() * (maxDist - minDist);
            
            const x = distance * Math.sin(phi) * Math.cos(theta);
            const y = distance * Math.sin(phi) * Math.sin(theta);
            const z = distance * Math.cos(phi);
            
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            sizeAttenuation: true
        });
        
        return new THREE.Points(starGeometry, starMaterial);
    };

    scene.add(createStarLayer(1000, 800, 1500));
    scene.add(createStarLayer(2000, 1500, 3000));
    scene.add(createStarLayer(3000, 3000, 6000));
}

addStars();

// Position camera
camera.position.set(500, 250, 500);
controls.update();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    sun.rotation.y += 0.002;
    sunGlow.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.1;
    
    planetObjects.forEach(({ planet, orbit, data }) => {
        const earthYear = 365;
        const relativeSpeed = earthYear / data.period;
        const timeScale = 0.25;
        const time = Date.now() * 0.001 * timeScale * relativeSpeed;
        
        // Calculate elliptical position
        const angle = time;
        const semiMajor = data.distance;
        const semiMinor = data.distance * Math.sqrt(1 - data.eccentricity * data.eccentricity);
        const x = Math.cos(angle) * semiMajor;
        const z = Math.sin(angle) * semiMinor;
        
        // Apply orbital inclination
        const incRad = (data.inclination * Math.PI) / 180;
        const rotatedZ = z * Math.cos(incRad);
        const y = z * Math.sin(incRad);
        
        planet.position.set(x, y, rotatedZ);
        planet.rotation.y += 0.005;
        
        // Update orbit line opacity
        const positions = orbit.geometry.attributes.position.array;
        const opacities = orbit.userData.opacities;
        
        for (let i = 0; i <= positions.length / 3; i++) {
            const orbitX = positions[i * 3];
            const orbitY = positions[i * 3 + 1];
            const orbitZ = positions[i * 3 + 2];
            
            const dx = orbitX - planet.position.x;
            const dy = orbitY - planet.position.y;
            const dz = orbitZ - planet.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            const fadeDistance = data.distance * 0.5;
            const opacity = Math.min(distance / fadeDistance, 1);
            opacities[i] = opacity * 0.3;
        }
        
        orbit.geometry.attributes.opacity.needsUpdate = true;
    });
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();