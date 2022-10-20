import React from "react";

function ContactForm() {
    return (
        <div id="contact-box" style={{maxWidth: "30em", width:"100%"}}>
            <form className="gform"
                  method="POST"
                  data-email="example@email.net"
                  action="https://qss6f2ya7wp4lnz47cdf32wutq0rwser.lambda-url.eu-west-1.on.aws">
                <ul className="actions">
                    <li>Let's talk about how we can help you</li>
                    <li style={{display: "flex"}}>
                        <input type="text"
                               name="name"
                               placeholder="Name (required)"
                               style={{
                                   width:"100%",
                                   fontFamily:"'Didact Gothic', sans-serif"
                               }}
                        />
                    </li>
                    <li style={{display: "flex"}}>
                        <input type="text"
                               name="email"
                               placeholder="Email (required)"
                               style={{
                                   width:"100%",
                                   fontFamily:"'Didact Gothic', sans-serif"
                               }}/>
                    </li>
                    <span className="email-invalid"
                          style={{display:"none"}}>
                        Must be a valid email address
                    </span>
                    <li style={{display: "flex"}}>
                        <textarea name="message"
                                  placeholder="Message / Business sector / Interest"
                                  style={{
                                      width:"100%",
                                      fontFamily:"'Didact Gothic', sans-serif"
                                  }}>
                        </textarea>
                    </li>
                    <li>
                        <button className="button" style={{
                            fontFamily:"'Didact Gothic', sans-serif"
                        }}>Contact
                            Us
                        </button>
                    </li>
                    <li>
                        <span className="thankyou_message" style={{display:"none"}}>
                            <em>Thanks</em> for contacting us!<br/>
                            We will get back to you soon!
                        </span>
                    </li>
                </ul>
            </form>
        </div>
    );
}
export default ContactForm;