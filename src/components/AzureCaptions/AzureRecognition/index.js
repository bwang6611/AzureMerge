import React from 'react'
import { isPureish } from '@babel/types';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import AzureKey from '../../AzureTopSpace/AzureOptions/Key';
import store from '../../../store/';
import {useSelector, connect} from 'react-redux'
import {bindActionCreators} from "redux"
import swal from 'sweetalert';

//const key = (state) =>state.azureKey
//7882896e3ffc4fe3b2f4c055f0914d67
var key = 'empty';
//const key = this.props.key;
var regionOption = 'northcentralus';
var lang = 'en-US';
var targetLang = 'en';

var speechConfig = null;

const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
var reco = null;

class AzureRecognition extends React.PureComponent {
    constructor() {

        super()
        this.state = {
           line: '',
        }
        key = store.azureKeyReducer;
        speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(key, regionOption);
        speechConfig.speechRecognitionLanguage = lang;
        speechConfig.addTargetLanguage(targetLang);
        reco = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);

        
        this.start = this.start.bind(this)
        this.stop = this.stop.bind(this)
    }

    componentDidMount() {
        this.start();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isRecording === this.props.isRecording)
             return
        if (this.props.isRecording)
             this.start()
        else this.stop()
   }


    start() {
        key = store.azureKeyReducer;
        console.log(key);
        var out = document.getElementById('out');
        var lastRecognized = out.innerHTML;
        // reco.recognizeOnceAsync(
        //     (result) => {
        //         switch (result.reason) {
        //             case SpeechSDK.ResultReason.RecognizedSpeech:
        //                 var div = document.createElement('div');
        //                 div.textContent = result.text;
        //                 out.appendChild(div);
        //                 break;
        //         }
        //     }

        // );

        reco.recognizing = function(s, e) {
            var language = targetLang;
            window.console.log(e);
            out.innerHTML = lastRecognized + e.result.translations.get(language);
        }

        reco.recognized = function (s,e) {
            window.console.log(e);
            var language = targetLang;
           
            lastRecognized += e.result.translations.get(language) + "\r\n";
            out.innerHTML = lastRecognized;
        }

        reco.canceled = function (s, e) {
            window.console.log(e);

            swal({
                title: "Warning!",
                text: "Wrong key or region!",
                icon: "warning",
            })
        };

        reco.startContinuousRecognitionAsync();

    }

    stop() {
        reco.stopContinuousRecognitionAsync(
            function() {
                reco.close();
                reco = undefined;

            },
            function (err) {
                reco.close();
                reco = undefined;
            }
        )
    }
    render() {
        // out holds all past lines. curr holds the current line.
        return (
             <div>

                  <div id='out'></div>
                    <p>{this.props.key}</p>

             </div>
        )
   }
}

export default AzureRecognition
