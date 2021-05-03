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

  public options: string[] = [
    'Gobierno electrónico', 'Seguridad', 'Salud',
    'Educación', 'Redes publicas', 'Eco-ciudad',
    'Movilidad inteligente', 'Contrucción y vivienda', 'Comunidad',
    'Desarrollo empresarial'
  ];

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dialog.open(MainDialogComponent, {
      data: {
        opt: this.options
      }
    });

    this.map = new mapboxgl.Map({
      container: 'mapa',
      style: 'mapbox://styles/jealzateu/cknepa4cg3ry217o4hda2kltp',
      center: [-75.921029433568, 45.28719674822362],
      zoom: 18,
      antialias: true
    });

    // Add the control to the map.
    this.map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl
      })
    );

    // this.addModel([-75.920929433568, 45.28709674822362], 'assets/models3D/firestation1.glb', '3d-model1');
    // this.addModel([-75.921229433568, 45.28719674822362], 'assets/models3D/Hotel(3star).glb', '3d-model2');
    // this.addModel([-75.920629433568, 45.28700674822362], 'assets/models3D/Restaurant.glb', '3d-model3');
    // this.addModel([-75.921529433568, 45.28729674822362], 'assets/models3D/pizzashop.glb', '3d-model4');

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
    // customLayer.onAdd();


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
            if (modelTransform.idMT === '3d-model1') {
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

      modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        [lng, lat],
        modelAltitude
      );

      // transformation parameters to position, rotate and scale the 3D model onto the map
      if (modelTransform.idMT === '3d-model1') {
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
