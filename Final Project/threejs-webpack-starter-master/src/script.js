import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


const loader = new THREE.TextureLoader();
const serpent = loader.load('./rainbow_slug.png')
    // Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry_2 = new THREE.TorusGeometry(.05, 1, 50, 100);
const geometry_baby_planet = new THREE.TorusGeometry(.05, .08, 100, 50);
// const geometry = new THREE.IcosahedronBufferGeometry(.2, 15);
const geometry = new THREE.RingGeometry(.4, 1, 500, 5);
const geometry_3 = new THREE.RingGeometry(.4, 1, 500, 5);
const geometry_4 = new THREE.RingGeometry(1.45, 1.46, 100);

const partical_geom = new THREE.BufferGeometry;
const part_count = 10000;

const part_Array = new Float32Array(part_count * 3);

for (let i = 0; i < part_count * 3; i++) {
    // part_Array[i] = Math.random();
    // part_Array[i] = Math.random() - 0.5
    part_Array[i] = (Math.random() - 0.5) * 5
}

partical_geom.setAttribute('position', new THREE.BufferAttribute(part_Array, 3));



// Materials
const material2 = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide });
const material = new THREE.PointsMaterial({
    size: 0.005,
    side: THREE.DoubleSide,
    // map: serpent,
    // transparent: true
    color: "white"
})

const material_red = new THREE.PointsMaterial({
    size: 0.01,
    side: THREE.DoubleSide,
    // color: 'red'
    // map: serpent,
    // transparent: true
    // color: "red"
})

const material_black = new THREE.PointsMaterial({
    size: 0.005,
    side: THREE.DoubleSide,
    color: 'white',

    // color: "red"
})
const partical_material = new THREE.PointsMaterial({
        size: 0.0005,
        // map: serpent,
        // transparent: true
    })
    // const partical_material = new THREE.PointsMaterial({
    //     size: 0.0005,
    // })



// Mesh
const sphere = new THREE.Points(geometry, material)
const sphere_2 = new THREE.Points(geometry_3, material)
const ring = new THREE.Mesh(geometry_4, material2)
const tor = new THREE.Points(geometry_2, material_black)
const tor_baby = new THREE.Points(geometry_baby_planet, material_red)
const particalSpace = new THREE.Points(partical_geom, partical_material)
scene.add(sphere, particalSpace, tor, sphere_2, tor_baby, ring)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(new THREE.Color('#21282a'), 1)


//Mouse 

document.addEventListener('mousemove', animateSpace)

let mouseX = 0
let mouseY = 0

function animateSpace(event) {
    mouseY = event.clientY
    mouseX = event.clientX
}

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.x = .25 * elapsedTime
    sphere_2.rotation.y = .5 * elapsedTime
    sphere_2.rotation.x = .1 * elapsedTime
    ring.rotation.y = .35 * elapsedTime
    ring.rotation.x = .15 * elapsedTime
    tor.rotation.y = .5 * elapsedTime
    tor_baby.rotation.x = 1 * elapsedTime
    tor_baby.rotation.y = 1.5 * elapsedTime
    particalSpace.rotation.y = -.1 * elapsedTime
    if (mouseX > 0) {
        particalSpace.rotation.x = -mouseY * (elapsedTime * 0.00005)
        particalSpace.rotation.y = mouseX * (elapsedTime * 0.00005)
    }

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()