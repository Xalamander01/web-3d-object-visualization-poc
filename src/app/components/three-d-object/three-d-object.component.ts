import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from "@angular/core";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { InfoModalComponent } from "./info-modal/info-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { ArticleEnum } from "./article/article.enum";
import { Router } from "@angular/router";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

@Component({
  selector: "app-three-d-object",
  imports: [],
  templateUrl: "./three-d-object.component.html",
  styleUrl: "./three-d-object.component.scss",
  standalone: true,
})
export class ThreeDObjectComponent {
  @ViewChild('canvasContainer', { static: true }) canvasRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationId!: number;
  private model!: THREE.Group;

  private get container(): HTMLDivElement {
    return this.canvasRef.nativeElement;
  }

  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(ambientLight, dirLight);
  }

  ngAfterViewInit(): void {
    this.initRenderer();
    this.initControls();
    this.loadModel();
    this.animate();

    window.addEventListener('resize', this.onWindowResize, false);
  }

  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.target.set(0, 1, 0);
  }

  private loadModel(): void {
    const loader = new GLTFLoader();

    // 🔹 Draco setup (must have decoder files under /assets/draco/)
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('assets/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      'assets/models/unfinished_abandoned_building_in_riga_test.glb',
      (gltf) => {
        this.model = gltf.scene;

        // Optional normalization
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
        this.model.scale.setScalar(scaleFactor);
        this.model.position.sub(center.multiplyScalar(scaleFactor));

        this.scene.add(this.model);
        console.log('✅ Model loaded');
      },
      (xhr) => {
        console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error('❌ Error loading model:', error);
      }
    );
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    this.controls.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize, false);
  }
}
