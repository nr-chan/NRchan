package models

import "go.mongodb.org/mongo-driver/v2/bson"

type Image struct{
    ID              bson.ObjectID   `bson:"_id,omitempty"`
    URL             string          `bson:"url" json:"url"`
    Size            uint64          `bson:"size,long" json:"size,long"`
    Width           uint            `bson:"width,int" json:"width,long"`
    Height          uint            `bson:"height,int" json:"height,int"`
    ThumbnailWidth  uint          `bson:"thumbnailWidth,int" json:"thumbnailWidth,long"`
    ThumbnailHeight uint          `bson:"thumbnailHeight,int" json:"thumbnailHeight,long"`
 }



