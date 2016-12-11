import {Component, OnInit, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Router, ActivatedRoute} from '@angular/router';
import { FirebaseService, UtilsService } from "../services";
import {Gift} from "../models";
//camera imports
//import { Image } from "ui/image";
//import { ImageSource, fromAsset, fromNativeSource } from "image-source";
import * as enums from 'ui/enums';
import * as imageSource from 'image-source';
//import { ImageAsset } from "image-asset";
//import * as appSettings from 'application-settings';

import * as camera from "nativescript-camera";
import * as fs from "file-system";

var imageModule = require("ui/image");
var img;

@Component({
  moduleId: module.id,
  selector: "gf-list-detail",
  templateUrl: "list-detail.html"
})
export class ListDetailComponent implements OnInit {
  
  id: string;
  name: string;
  description: string;
  image: any;
  private sub: any;
  private imagePath: string;
  private uploadedImageName: string;
  private uploadedImagePath: string;
  public gift: Observable<any>;
  
  constructor(
        private route: ActivatedRoute,
        private router: Router,
        private ngZone: NgZone,
        private firebaseService: FirebaseService,
        private utilsService: UtilsService
    ) {}

 ngOnInit() {
   camera.requestPermissions();
   this.sub = this.route.params.subscribe((params: any) => {
      this.id = params['id'];
      this.firebaseService.getMyGift(this.id).subscribe((gift) => {
        this.ngZone.run(() => {
          for (let prop in gift) {
            //props
            if (prop === "id") {
              this.id = gift[prop];
            }
            if (prop === "name") {
              this.name = gift[prop];
            }
            if (prop === "description") {
              this.description = gift[prop];
            }                       
          }
        });
      });
    });  
  }

takePhoto() {
  let options = {
            width: 300,
            height: 300,
            keepAspectRatio: true,
            saveToGallery: true
        };
    camera.takePicture(options)
        .then(imageAsset => {
            imageSource.fromAsset(imageAsset).then(res => {
                this.image = res;
                //save the source image to a file, then send that file path to firebase
                this.saveToFile(this.image);
            })
        }).catch(function (err) {
            console.log("Error -> " + err.message);
        });
}

saveToFile(res){
  let imgsrc = res;
        this.imagePath = this.utilsService.documentsPath(`photo-${Date.now()}.png`);
        imgsrc.saveToFile(this.imagePath, enums.ImageFormat.png);       
}


editGift(id: string){
  if(this.imagePath){
    //upload the file, then save all
    this.firebaseService.uploadFile(this.imagePath).then((uploadedFile: any) => {
          this.uploadedImageName = uploadedFile.name;
          //get downloadURL and store it as a full path;
          this.firebaseService.getDownloadUrl(this.uploadedImageName).then((downloadUrl: string) => {
            this.firebaseService.editGift(id,this.description,downloadUrl).then((result:any) => {
              alert(result)
            }, (error: any) => {
                alert(error);
            });
          })
        }, (error: any) => {
          alert('File upload error: ' + error);
        });
  }
  else {
    //just edit the description
    this.firebaseService.editGift(id,this.description,"").then((result:any) => {
        alert(result)
    }, (error: any) => {
        alert(error);
    });
  }
     
}



}