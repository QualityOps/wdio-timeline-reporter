import React from 'react'

const Modal = () => {
    return (
        <div className="modal">
            <div className="modal-background"></div>
            <div className="modal-content">
                <p className="image">
                    <img id="show-me" src="#" alt=""></img>
                </p>
            </div>
            <button className="modal-close is-large" aria-label="close"></button>
        </div>    
    );
}

export default Modal;