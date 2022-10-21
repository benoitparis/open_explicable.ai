import React from "react";
import styles from "./WebsiteContactForm.module.css";

function WebsiteContactForm() {
    return (
        <div className={styles.contactBox} style={{maxWidth: "30em", width:"100%"}}>
            <form className="gform"
                  method="POST"
                  data-email="example@email.net"
                  action="https://qss6f2ya7wp4lnz47cdf32wutq0rwser.lambda-url.eu-west-1.on.aws">
                <ul className={styles.ulActions}>
                    <li className={styles.ulActionsLi}>Let's talk about how we can help you</li>
                    <li className={styles.ulActionsLi} style={{display: "flex"}}>
                        <input className={styles.ulActionsLiInput}
                               type="text"
                               name="name"
                               placeholder="Name (required)"
                               style={{
                                   width:"100%",
                                   fontFamily:"'Didact Gothic', sans-serif"
                               }}
                        />
                    </li>
                    <li className={styles.ulActionsLi} style={{display: "flex"}}>
                        <input className={styles.ulActionsLiInput}
                               type="text"
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
                    <li className={styles.ulActionsLi} style={{display: "flex"}}>
                        <textarea className={styles.ulActionsTextarea}
                                  name="message"
                                  placeholder="Message / Business sector / Interest"
                                  style={{
                                      width:"100%",
                                      fontFamily:"'Didact Gothic', sans-serif"
                                  }}>
                        </textarea>
                    </li>
                    <li className={styles.ulActionsLi} >
                        <button className={styles.button} style={{
                        }}>Contact
                            Us
                        </button>
                    </li>
                    <li className={styles.ulActionsLi}>
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
export default WebsiteContactForm;