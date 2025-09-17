import { Component, ElementRef, HostListener, inject, ViewChild } from "@angular/core";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { InfoModalComponent } from "./info-modal/info-modal.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-three-d-object",
  imports: [InfoModalComponent],
  templateUrl: "./three-d-object.component.html",
  styleUrl: "./three-d-object.component.scss",
  standalone: true
})
export class ThreeDObjectComponent {
  @ViewChild("canvas", { static: true }) private canvasRef!: ElementRef;
  private dialog = inject(MatDialog);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  ngAfterViewInit(): void {
    this.initScene();
    this.loadModel();
    this.animate();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;

    // Scene + Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(20, 30, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040);
    this.scene.add(ambient);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      "assets/models/Lantern.glb",
      (gltf: { scene: any }) => {
        this.scene.add(gltf.scene);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());

        this.controls.target.copy(center);
        this.camera.lookAt(center);
      },
      undefined,
      (error: any) => {
        console.error("Error loading model:", error);
      }
    );
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // Detect clicks
  @HostListener("click", ["$event"])
  onClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      this.dialog.open(InfoModalComponent, {
      width: '400px',
      data: { name: intersects[0].object.name },
    });
      // later: route navigation or popup trigger here
    }
  }

  @HostListener("window:resize")
  onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
