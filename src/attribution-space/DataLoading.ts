// import * as THREE from "three";
//
//
// export type DataConfiguration = {
//     "binary-participations": string,
//     "data-prediction-embedding-cluster": string,
//     "datapoint_number": number,
//     "features": Array<string>,
//     "label_mapping": object,
//     "mean": number,
//     "predicted_variables": Array<string>,
//     "rule-definitions": string,
//     "rule_number": number,
//     "std": number
// }
//
// const loadConfiguration = () => {
//     const loader = new THREE.FileLoader();
//
//     loader.load(
//         'data/conf.json',
//         (data) => {
//             const configuration = JSON.parse(data as string) as DataConfiguration;
//             console.log(configuration);
//
//             loadDataPoints(configuration);
//             // loadRuleParticipations
//             // loadRuleDefinitions
//         },
//         function(xhr) {},
//         function(error) {
//             console.log('An error happened loading the configuration: ');
//             console.log(error);
//         }
//     );
// }
//
// export type DataPoint = {
//     index:number,
//     mean:number,
//     prediction:number,
//     featureNames:Array<string>,
//     featureValues:Array<number>,
//     attributionValues:Array<number>,
// }
//
// const loadDataPoints = (configuration:DataConfiguration) => {
//     console.log("loadParticles")
//
//     var loader = new THREE.FileLoader();
//
//     loader.load(
//         'data/' + configuration['data-prediction-embedding-cluster'],
//         (data) => {
//
//             console.log("loader.load")
//             // faudrait faire par naming des colonnes csv, limit avec un schema,
//             //   [convention d'avoir les predicted_variables en premier avant les features?
//             //   un sqlite?
//             var lines = (data as string).trim().split('\n');
//
//             let condensedTree = [];
//
//             for (var i = 1; i < lines.length; i++) {
//
//                 var parts = lines[i].split(',');
//                 var j = 0;
//                 var index = parseInt(parts[j++], 10);
//                 var prediction = -1;
//                 configuration['predicted_variables'].forEach((item:any) => {
//                     // save data..
//                     j++;
//                 });
//                 configuration['features'].forEach((item:any) => {
//                     // save data..
//                     j++;
//                 })
//                 configuration['predicted_variables'].forEach((item:any) => {
//                     // convention: appended _prediction to name (TODO enforce? dans le schema?)
//                     // on suppose qu'il n'y en a qu'une
//                     prediction = parseFloat(parts[j++]);
//                 });
//
//                 const parent = parseInt(parts[j++], 10);
//                 const lambda_val = parseFloat(parts[j++]);
//                 const size = parseInt(parts[j++], 10);
//                 const x = parseFloat(parts[j++]);
//                 const y = parseFloat(parts[j++]);
//                 const z = parseFloat(parts[j++]);
//
//                 // faudrait valider que index affine sur i
//                 if (index !== i - 1) {
//                     console.log("" + index + " vs " + (i-1) );
//                     throw "Data file must be sorted by index";
//                 }
//
//                 condensedTree[index] = {
//                     "identity" : index,
//                     "size" : size,
//                     "lambda_val": lambda_val,
//                     "parent" : parent,
//                     "children" : [],
//                     "x" : x,
//                     "y" : y,
//                     "z" : z
//                 };
//
//                 const point = new THREE.Vector3(x, y, z);
//                 const color = new THREE.Color();
//                 let particleSize = 0;
//
//                 const scaledPrediction = Math.max(0, Math.min(1,(prediction - configuration['mean']) / 2 / configuration['std']));
//
//                 if (1 === size) {
//                     color.setRGB(scaledPrediction, 0.2, 1 - scaledPrediction);
//                     particleSize = PARTICLE_SIZE * 0.5;
//                     addParticle(point, color, particleSize);
//
//                 } else {
//                     // tree nodes
//                     color.setRGB(0.3, 0.3, 0.3);
//                     particleSize = Math.log(size * 10 + 1) * PARTICLE_SIZE / 8;
//                     if (4 >= size) {
//                         particleSize = 0;
//                     }
//                     // TODO refaire les trees en 3D, les loader séparément, faire de l'UI
//                     // addParticle(point, color, particleSize);
//                 }
//
//             }
//
//
//
//             // link parents to children
//             // for (var k in condensedTree) {
//             //     var item = condensedTree[k];
//             //     var parent = condensedTree[item["parent"]];
//             //     if (parent) {
//             //         parent["children"].push(item["identity"]);
//             //     } else {
//             //
//             //     }
//             // };
//
//             updateAttributes();
//             updateBoundingSphere();
//
//         },
//         function(xhr) {},
//         function(error) {
//             console.log('An error happened');
//         }
//     );
// }
//
//
//
//
//
//
export default {};
