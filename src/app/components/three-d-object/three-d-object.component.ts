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

@Component({
  selector: "app-three-d-object",
  imports: [],
  templateUrl: "./three-d-object.component.html",
  styleUrl: "./three-d-object.component.scss",
  standalone: true,
})
export class ThreeDObjectComponent {
  @ViewChild("canvas", { static: true }) private canvasRef!: ElementRef;
  private dialog = inject(MatDialog);
  private router = inject(Router);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private isDragging = false;
  private dragStart = { x: 0, y: 0 };

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

  @HostListener("mousedown", ["$event"])
  onMouseDown(event: MouseEvent): void {
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.isDragging = false;
  }

  @HostListener("mousemove", ["$event"])
  onMouseMove(event: MouseEvent): void {
    const dx = Math.abs(event.clientX - this.dragStart.x);
    const dy = Math.abs(event.clientY - this.dragStart.y);

    if (dx > 5 || dy > 5) {
      this.isDragging = true;
    }
  }

  @HostListener("mouseup", ["$event"])
  onMouseUp(event: MouseEvent): void {
    if (!this.isDragging) {
      this.handleClick(event); // run your raycaster here
    }
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );

    if (intersects.length > 0) {
      const clickedObjectName = intersects[0].object.name;
      this.dialog
        .open(InfoModalComponent, {
          width: "400px",
          data: { name: intersects[0].object.name },
        })
        .afterClosed()
        .subscribe((result) => {
          if (result === "articleRedirect") {
            if (
              (Object as any).values(ArticleEnum).includes(clickedObjectName)
            ) {
              this.router.navigate(["/article", clickedObjectName]);
            } else {
              console.warn("No article found for:", clickedObjectName);
            }
          }
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
