import React, { Component } from "react";
import { render } from "react-dom";
import { faq_data } from "../utils/constants.js";

export default class Faq extends Component {

  

  
  render() {
    return (
      <div className="faq">
        <p className="heading">FREQUENTLY ASKED QUESTIONS</p>

        <div className = "data-1">
            {
              faq_data.map(function(item,index){
                <Question text = {item.que}/>
                <Answer text = {item.ans}/>
              })
            }
        </div>
  }
        </div>
    );
  }
}
