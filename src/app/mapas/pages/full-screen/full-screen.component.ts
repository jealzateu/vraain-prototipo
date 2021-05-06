import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import * as mapboxgl from 'mapbox-gl';
// @ts-ignore
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
// @ts-ignore
import * as THREE from 'three';
// @ts-ignore
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {MainDialogComponent} from './mainDialog/mainDialog';
import {FormBuilder, FormGroup, FormArray, FormControl, ValidatorFn, Validators} from '@angular/forms';

@Component({
  selector: 'app-full-screen',
  templateUrl: './full-screen.component.html',
  styles: [
    `
      body {
        margin: 0;
        padding: 0;
      }
      #mapa {
        /*position: absolute;*/
        top: 0;
        bottom: 0;
        height: 100%;
        width: 100%;
      }
    `
  ]
})
export class FullScreenComponent implements OnInit {

  public map: any;
  public modelOrigin: any;
  public mods: any[] = [];
  public models: any[] = [];
  public ids: any[] = [];
  public lar = 1;
  public listaModelos: any[] = [];
  public mover = false;
  public idActual = '';

  form: FormGroup;

  public options: string[] = [
    'Gobierno electrónico', 'Seguridad', 'Salud',
    'Educación', 'Redes publicas', 'Eco-ciudad',
    'Movilidad inteligente', 'Contrucción y vivienda', 'Comunidad',
    'Desarrollo empresarial'
  ];

  constructor(
    public dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      listaModelos: ['']
    });
  }

  ngOnInit(): void {
    this.dialog.open(MainDialogComponent, {
      data: {
        opt: this.options
      }
    });

    this.cargarMapa();

    // Add the control to the map.
    this.map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl
      })
    );
  }

  getList(): any[] {
    const nombres = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.models.length; i++) {
      nombres.push({name: this.models[i].substring(16, this.models[i].length - 4)});
    }

    return nombres;
  }

  submit(): void {
    this.models.filter(modelo =>
      {
        if (modelo.substring(16, modelo.length - 4) === this.form.value.listaModelos){
          const index = this.models.indexOf(modelo);
          this.idActual = this.ids[index];
          this.cargarMapa();
          this.cargarModelos();
        }
      },
    );
  }

  move(): void {
    this.mover = true;

  }

  callAddModel(mod: any[], model: string, id: string): any {

    this.mods.push(mod);
    this.models.push(model);
    this.ids.push(id);

    if (this.ids.length === 1) {
      this.cargarMapa();
      this.listaModelos = this.getList();
    }else{
      // tslint:disable-next-line:prefer-for-of
      for (let i = this.ids.length - 1; i >= 0; i--) {
        if (this.ids.indexOf(this.ids[i]) !== i) {
          this.ids.splice(i, 1);
          this.models.splice(i, 1);
          this.mods.splice(i, 1);
        }
      }
    }

    if (this.lar !== this.ids.length) {
      this.lar = this.ids.length;
      this.cargarMapa();
      this.listaModelos = this.getList();
    }

    this.cargarModelos();
  }

  cargarMapa(): void {
    this.map = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/jealzateu/cknepa4cg3ry217o4hda2kltp',
      center: [-75.921029433568, 45.28719674822362],
      zoom: 18,
      antialias: true
    });
  }

  cargarModelos(): void {
    for (let i = 0; i < this.models.length; i++) {
      this.addModel(this.mods[i], this.models[i], this.ids[i]);
    }
  }

  addModel(mod: any[], model: string, id: string): any {

    this.modelOrigin = mod;
    const modelAltitude = 0;
    let modelRotate = [Math.PI / 2, 0, 0];
    let longitude: number = mod[0];
    let latitude: number = mod[1];
    let rotate = 0;
    const mapa = this.map;

    let modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      this.modelOrigin,
      modelAltitude
    );

    // transformation parameters to position, rotate and scale the 3D model onto the map
    let modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
      idMT: id
    };

    // const THREE = window.THREE;
    let camera: any;
    let scene: any;
    let renderer: any;
    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    const customLayer: any = {
      id,
      type: 'custom',
      renderingMode: '3d',
      // tslint:disable-next-line:no-shadowed-variable
      onAdd(map: any, gl: any): any {
        camera = new THREE.Camera();
        scene = new THREE.Scene();

        // create two three.js lights to illuminate the model
        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(100, 100, 100).normalize();
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(100, 100, 100).normalize();
        scene.add(directionalLight2);

        // use the three.js GLTF loader to add the 3D model to the three.js scene
        // tslint:disable-next-line:prefer-const
        const loader = new GLTFLoader();
        loader.load(
          model,
          // tslint:disable-next-line:only-arrow-functions
          function(gltf: any): any {
            scene.add(gltf.scene);
          }.bind(this)
        );

        // use the Mapbox GL JS map canvas for three.js
        renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });

        renderer.autoClear = false;
      },
      render(gl: any, matrix: any): any {
        const rotationX = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(1, 0, 0),
          modelTransform.rotateX,
        );
        const rotationY = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 1, 0),
          modelTransform.rotateY
        );
        const rotationZ = new THREE.Matrix4().makeRotationAxis(
          new THREE.Vector3(0, 0, 1),
          modelTransform.rotateZ
        );

        const m = new THREE.Matrix4().fromArray(matrix);
        const l = new THREE.Matrix4()
          .makeTranslation(
            modelTransform.translateX,
            modelTransform.translateY,
            modelTransform.translateZ
          )
          .scale(
            new THREE.Vector3(
              modelTransform.scale,
              -modelTransform.scale,
              modelTransform.scale
            )
          )
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        camera.projectionMatrix = m.multiply(l);
        renderer.resetState();
        renderer.render(scene, camera);
        mapa.triggerRepaint();
      }
    };


    const currentID = this.idActual;
    // tslint:disable-next-line:only-arrow-functions
    mapa.on('style.load', function(): any {
      mapa.getCanvas().addEventListener(
        'keydown',
        (e: any) => {
          if (e.keyCode === 65) {

            rotate += 0.5;
            modelRotate = [Math.PI / 2, rotate, 0];

            modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
              [longitude, latitude],
              modelAltitude
            );

            // transformation parameters to position, rotate and scale the 3D model onto the map
            if (modelTransform.idMT === currentID) {
              modelTransform = {
                translateX: modelAsMercatorCoordinate.x,
                translateY: modelAsMercatorCoordinate.y,
                translateZ: modelAsMercatorCoordinate.z,
                rotateX: modelRotate[0],
                rotateY: modelRotate[1],
                rotateZ: modelRotate[2],
                scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
                idMT: id
              };
            }
          }
        });
      mapa.addLayer(customLayer, 'waterway-label');
    });


    mapa.on('click',
      (e: { lngLat: any; }) => {

      const { lng, lat } = e.lngLat;
      longitude = lng;
      latitude = lat;
      this.mods[this.ids.indexOf('3d-model1')] = [lng, lat];

      modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        [lng, lat],
        modelAltitude
      );

      // transformation parameters to position, rotate and scale the 3D model onto the map
      if (modelTransform.idMT === currentID) {
        modelTransform = {
          translateX: modelAsMercatorCoordinate.x,
          translateY: modelAsMercatorCoordinate.y,
          translateZ: modelAsMercatorCoordinate.z,
          rotateX: modelRotate[0],
          rotateY: modelRotate[1],
          rotateZ: modelRotate[2],
          scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
          idMT: id
        };
      }
    });
  }

}
