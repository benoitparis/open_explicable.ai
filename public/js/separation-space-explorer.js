
if (WEBGL.isWebGLAvailable() === false) {
  document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

// Globals
var renderer, scene, camera, stats;
var PARTICLE_SIZE = 1.5;
var raycaster, intersects;
var mouse, INTERSECTED;
var lastMouseMoveDate = Date.now() - 5000;
var configuration;

// TODO what do we do about this?
var MAX_POINTS = 11442;
var drawCount = 0;
var originalColors = new Float32Array( MAX_POINTS * 3 );
var particles;

var participations = [];
var ruleDefinitions = {};

var condensedTree = {};

init();
animate();
initParticles();

loadConfiguration([loadParticles, loadRuleParticipations, loadRuleDefinitions]);

// Init functions

function init() {

  var container = document.getElementById( 'eml-container' );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 45, document.body.clientWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 35;

  
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( document.body.clientWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // controls
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;
  // pour la démo
  controls.enableZoom = false;
  controls.enableKeys = false;
  
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // stats
  stats = new Stats();
  // TODO faudra faire un debug mode? on désactive ici pour démo sur le site
  // container.appendChild( stats.dom );

  // events
  window.addEventListener( 'resize', onWindowResize, false );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'click', onClick, false );

}

function initParticles() {
  var geometry = new THREE.BufferGeometry();
  
  var positions = new Float32Array( MAX_POINTS * 3 );
  var colors = new Float32Array( MAX_POINTS * 3 );
  var sizes = new Float32Array( MAX_POINTS );
  // déja buffered? aka on peut avoir le load asynch un peu sale? faudra ptet aussi les colors dans le même fichier
  geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
  geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

  var material = new THREE.ShaderMaterial( {

    uniforms: {
      color: { value: new THREE.Color( 0xffffff ) },
      texture: { value: new THREE.TextureLoader().load( "sprites/disc.png" ) }
    },
    vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          gl_PointSize = size * ( 300.0 / -mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
        }`,
    fragmentShader: `
        uniform vec3 color;
        uniform sampler2D texture;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4( color * vColor, 1.0 );
          gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
          if ( gl_FragColor.a < ALPHATEST ) discard;
        }`,

    alphaTest: 0.9

  } );

  particles = new THREE.Points( geometry, material );
  scene.add( particles );
}


// Load functions

function loadConfiguration(dependencies) {

  var loader = new THREE.FileLoader();

  loader.load(
    'data/conf.json',
    function(data) {
      configuration = JSON.parse(data);
      //console.log(configuration);
      
      dependencies.forEach(function(item){
        item.call();
      })
      
    },
    function(xhr) {},
    function(error) {
      console.log('An error happened loading the configuration: ');
      console.log(error);
    }
  );

}

function loadParticles() {

  var loader = new THREE.FileLoader();

  loader.load(
    'data/' + configuration['data-prediction-embedding-cluster'],
    function ( data ) {
      // faudrait faire par naming des colonnes csv, limit avec un schema, 
      //   [convention d'avoir les predicted_variables en premier avant les features?
      //   un sqlite?
      var lines = data.trim().split('\n');
      
      for (var i = 1; i < lines.length; i++) {
        
        var parts = lines[i].split(',');
        var j = 0;
        var index = parseInt(parts[j++], 10);
        var prediction = -1;
        configuration['predicted_variables'].forEach(function(item){
          // save data..
          j++;
        });
        configuration['features'].forEach(function(item){
          // save data..
          j++;
        })
        configuration['predicted_variables'].forEach(function(item){
          // convention: appended _prediction to name (TODO enforce? dans le schema?)
          // on suppose qu'il n'y en a qu'une
          prediction = parseFloat(parts[j++]);
        });
        
        var parent = parseInt(parts[j++], 10);
        var lambda_val = parseFloat(parts[j++]);
        var size = parseInt(parts[j++], 10);
        var x = parseFloat(parts[j++]);
        var y = parseFloat(parts[j++]);
        var z = parseFloat(parts[j++]);
        
        // faudrait valider que index affine sur i 
        if (index !== i - 1) {
          console.log("" + index + " vs " + (i-1) );
          throw "Data file must be sorted by index";
        }
        
        condensedTree[index] = {
          "identity" : index,
          "size" : size,
          "lambda_val": lambda_val,
          "parent" : parent,
          "children" : [],
          "x" : x,
          "y" : y,
          "z" : z
        };
        
        var point = new THREE.Vector3(x, y, z);
        var color = new THREE.Color();
        var particleSize = 0;
        
        
        if (1 === size) {
          color.setRGB(prediction, 0.2, 1 - prediction);
          particleSize = PARTICLE_SIZE * 0.5;
        } else {
          color.setRGB(0.3, 0.3, 0.3);
          particleSize = Math.log(size * 10 + 1) * PARTICLE_SIZE / 8;
          if (4 >= size) {
            particleSize = 0;
          }
        }
        
        addParticle(point, color, particleSize);
      }
      
      
      
      // link parents to children
      for (var k in condensedTree) {
        var item = condensedTree[k];
        var parent = condensedTree[item["parent"]];
        if (parent) {
          parent["children"].push(item["identity"]);
        } else {
          
        }
      };
      
      // tell Three to recompute where needed
      updateGeometry();
      
    },
    function(xhr) {},
    function(error) {
      console.log('An error happened');
    }
  );
}

function addParticle(vertex, color, size) {
  var geometry = particles.geometry;
  var attributes = geometry.attributes;
  var positions = attributes.position.array;
  var colors = attributes.customColor.array;
  var sizes = attributes.size.array;
  vertex.toArray( positions, drawCount * 3 );
  color.toArray( colors, drawCount * 3 );
  color.toArray( originalColors, drawCount * 3 );
  sizes[drawCount] = size;
  drawCount++;
  particles.geometry.setDrawRange( 0, drawCount );
  
}

function updateGeometry() {
  // https://stackoverflow.com/questions/15512089/ray-interstectobjects-not-intersecting-correctly-after-geometry-is-dynamically-m
  // whatever
  var geometry = particles.geometry;
  var attributes = geometry.attributes;
  attributes.position.needsUpdate = true;
  attributes.customColor.needsUpdate = true;
  attributes.size.needsUpdate = true;
  geometry.verticesNeedUpdate = true;
  geometry.normalsNeedUpdate = true; 
  geometry.computeFaceNormals(); 
  geometry.computeVertexNormals(); 
  geometry.computeBoundingSphere();
  
}

function loadRuleParticipations() {

  var loader = new THREE.FileLoader();

  loader.load(
    'data/' + configuration['binary-participations'],
    function ( data ) {
      var lines = data.trim().split('\n');
      
      for (var i = 0; i < configuration['rule_number']; i++) {
        participations.push(new FastBitSet());
      }
      
      for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split(',');
        for (var j = 0; j < parts.length; j++) {
          if ("1" == parts[j]) {
            participations[j].add(i);
          }
        }
      }
      
      participationLoaded = true;
    },
    function(xhr) {},
    function(error) {
      console.log('An error happened');
    }
  );
}

function loadRuleDefinitions() {

  var loader = new THREE.FileLoader();

  loader.load(
    'data/' + configuration['rule-definitions'],
    function ( data ) {
      var lines = data.trim().split('\n');
      
      for (var i = 1; i < lines.length; i++) {
        var parts = lines[i].split(',');
        ruleDefinitions[parts[0]] = parts[1];
      }
    },
    function(xhr) {},
    function(error) {
      console.log('An error happened');
    }
  );
}

// Animation functions
function changeColor(index) {
  bitset = participations[index];
  changeColorBitSet(bitset);
}

function changeColorBitSet(bitset) {
  var colors = particles.geometry.attributes.customColor.array;
  var color = new THREE.Color();
  for (var i = 0; i < configuration['datapoint_number']; i++) {
    if (bitset.has(i)) {
      colors[i * 3 + 0] = originalColors[i * 3 + 0];
      colors[i * 3 + 1] = originalColors[i * 3 + 1];
      colors[i * 3 + 2] = originalColors[i * 3 + 2];
    } else {
      color.setRGB( 0.5, 0.5, 0.5 );
      color.toArray( colors, i * 3 );
    }
  }
  particles.geometry.attributes.customColor.needsUpdate = true;
}

var currentParticipationIndex = 0;
function loopParticipations() {
  if (participations.length > 0) {
    changeColor(currentParticipationIndex);
  }
  currentParticipationIndex = (currentParticipationIndex + 1) % participations.length;
  setTimeout(loopParticipations, 100);
}

function findBestParticipation(selection) {
  var bestScore = 0;
  var bestParticipationIndex = -1;
  
  for (var i = 0; i < participations.length; i++) {
    var current = participations[i];
    // on voulait faire entropy, mais Jaccard marche
    //   et ça: https://en.wikipedia.org/wiki/Mutual_information ?
    // https://en.wikipedia.org/wiki/Jaccard_index
    var currentScore = selection.intersection_size(current) / selection.union_size(current);
    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestParticipationIndex = i;
    }
  }
  return bestParticipationIndex;
}

function onDocumentMouseMove( event ) {
  event.preventDefault();
  // l'est là le décalage du hover?
  mouse.x = ( event.clientX / document.body.clientWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  lastMouseMoveDate = Date.now();
  insersectAndHighlight();
}

function onWindowResize() {
  camera.aspect = document.body.clientWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( document.body.clientWidth, window.innerHeight );
}

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  if (particles) {
    // V+ le faire que si en pause depuis 10 secondes? en mode animation
    // demo: perma rotation
    // on refera le mode idle et pas perma rotation dans le produit
    //   faudrait une variable d'env qui soit en mode localisation: product, demo-site
    //if ((Date.now() - lastMouseMoveDate) > 3000) {
      particles.rotation.y += 0.001;
    //}
    

    var geometry = particles.geometry;
    var attributes = geometry.attributes;

    raycaster.setFromCamera( mouse, camera );

    intersects = raycaster.intersectObject( particles, true );

    if ( intersects.length > 0 ) {

      if ( INTERSECTED != intersects[ 0 ].index ) {
        
        //console.log(intersects);

        attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;

        INTERSECTED = intersects[ 0 ].index;

        attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
        attributes.size.needsUpdate = true;

      }

    } else if ( INTERSECTED !== null ) {

      attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
      attributes.size.needsUpdate = true;
      INTERSECTED = null;

    }
  
  }

  renderer.render( scene, camera );

}

function onClick() {
  // fix selection?
}

// fonction buggée:
//   le intersect te renvoie un index, et à cet index il y a du x,y,z différent
// on aimerait bien debug, mais on va pas faire now, on passe à autre chose pour avancer
function insersectAndHighlight() {
  //console.log("clicking");
  if (particles) {

    var geometry = particles.geometry;
    var attributes = geometry.attributes;
    raycaster.setFromCamera( mouse, camera );
    intersects = raycaster.intersectObject( particles );

    if ( intersects.length > 0 ) {
      //console.log(intersects);
      var selectedIndex = -1;
      var maxSizeSoFar = -1;
      intersects.forEach(function(item){
        // TODO dire need of conf 
        // on en charge deux fois trop
        
        //console.log(item);
        //console.log(condensedTree[item.index]);
        var node = condensedTree[item.index];
        if (node === undefined) {
          console.log('node was undefined');
          console.log(item);
        }
        var size = node.size;
        if (size > 1 && size > maxSizeSoFar) {
          maxSizeSoFar = size;
          selectedIndex = item.index;
        }
      });
      if (selectedIndex >= 0) {
        //console.log("selecting: " + selectedIndex);
        // quand on clique sur la root, on devrait avoir le max. faudrait ptet un noeud root pour dire: on select tout
        //changeColorBitSet(new FastBitSet(recursivelyGetChildrenArray(selectedIndex)));
        var children = recursivelyGetChildrenArray(selectedIndex);
        var bestparticipation = findBestParticipation(new FastBitSet(children));
        //console.log('best participation index:' + bestparticipation);
        console.log(ruleDefinitions[bestparticipation]);
        changeColor(bestparticipation);
      }
    } else {
      // add full as root / additionnal conf
      changeColorBitSet(new FastBitSet(Array(configuration['datapoint_number']).keys()));
    }
  }
}

function recursivelyGetChildrenArray(index) {
  var item = condensedTree[index];
  var children = item["children"];
  if (Array.isArray(children) && children.length === 0) {
    return [index];
  } else {
    var result = [];
    children.forEach(function(child){
      result = result.concat(recursivelyGetChildrenArray(child))
    });
    return result;
  }
}

