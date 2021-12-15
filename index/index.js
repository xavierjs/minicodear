import faceFilter from "../libs/jeelizFaceFilter.moduleNoDOM.js";
import neuralNetworkModel from "../neuralNets/NN_DEFAULT";


const vw = 288
const vh = 384

//const arrayBuffer = new Uint8Array(vw * vh * 4); // vw and vh are video width and height in pixels
const FAKEVIDEOELEMENT = {
  isFakeVideo: true, //always true
  arrayBuffer: null, // the WeChat video arrayBuffer
  videoHeight: vh, // height in pixels
  videoWidth: vw, //width in pixels
  needsUpdate: false // boolean
};

let INPUTDEBUG = null

Page({
  data: {
    width: 288,
    height: 384,
  },
  onReady: function () {
    const selector = wx.createSelectorQuery()
    selector.selectAll('.cv')
      .node(this.init.bind(this))
      .exec()

    const selector2 = wx.createSelectorQuery()
    selector2.select('#displayVal')
      .node((res) => {
        INPUTDEBUG = res.node
      }).exec()
  },

  // callback: launched if a face is detected or lost
  detect_callback(faceIndex, isDetected) {
    if (isDetected) {
      console.log("INFO in detect_callback(): DETECTED");
    } else {
      console.log("INFO in detect_callback(): LOST");
    }
  },


  init_faceFilter(canvas, cb) {
    const that = this;
    faceFilter.init({
      followZRot: true,
      canvas: canvas,
      videoSettings: {
        videoElement: FAKEVIDEOELEMENT
      },
      maxFacesDetected: 1,
      NNC: neuralNetworkModel,
      callbackReady: function (errCode, spec) {
        if (errCode) {
          wx.showToast({
            title: 'FF ERROR: ' + errCode,
          });
          console.log("AN ERROR HAPPENS. ERROR CODE =", errCode);
          return;
        }
        // [init scene with spec...]
        console.log("INFO: JEELIZFACEFILTER IS READY");
        
        if (cb){
          cb();
        }
      }, //end callbackReady()
      // called at each render iteration (drawing loop)
      callbackTrack: function (detectState) {
        // console.log(detectState);
        if (INPUTDEBUG !== null){
          INPUTDEBUG.value = detectState.detected.toFixed(4);
        }

      },
    });
  },


  init(res) {
    const canvas = res[0].node
    canvas.addEventListener = function() {}
    canvas.removeEventListener = function () {}
    const context = wx.createCameraContext()
    var isInitialized = false
    faceFilter.FAKEDOM.window.setCanvas(canvas)
    let isFFInitialized = false
    this.init_faceFilter(canvas, function(){
      isFFInitialized = true
    })

    const listener = context.onCameraFrame((frame) => {
      if (isFFInitialized){
        FAKEVIDEOELEMENT.arrayBuffer = new Uint8Array(frame.data)
        FAKEVIDEOELEMENT.videoWidth = frame.width
        FAKEVIDEOELEMENT.videoHeight = frame.height
        FAKEVIDEOELEMENT.needsUpdate = true
      }
    })
    listener.start()
  }
})