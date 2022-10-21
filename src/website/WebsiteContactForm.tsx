import React from "react";
import styles from "./WebsiteContactForm.module.css";
import stylesG from "./Globals.module.css";
import {classes} from "./Utils";

const WebsiteContactForm = () => {
    return (
        <div id="contact" className={styles.contactBox} style={{}}>
            <form className="gform"
                  method="POST"
                  data-email="example@email.net"
                  action="https://qss6f2ya7wp4lnz47cdf32wutq0rwser.lambda-url.eu-west-1.on.aws">
                <ul className={styles.ulActions}>
                    <li className={styles.ulActionsLi}>Let's talk about how we can help you</li>
                    <li className={styles.ulActionsLi}>
                        <input className={styles.ulActionsLiInput}
                               type="text"
                               name="name"
                               placeholder="Name (required)"
                        />
                    </li>
                    <li className={styles.ulActionsLi}>
                        <input className={styles.ulActionsLiInput}
                               type="text"
                               name="email"
                               placeholder="Email (required)"
                        />
                    </li>
                    <span className={stylesG.centered} style={{display:"none"}}>
                        Must be a valid email address
                    </span>
                    <li className={styles.ulActionsLi}>
                        <textarea className={styles.ulActionsTextarea}
                                  name="message"
                                  placeholder="Message / Business sector / Interest">
                        </textarea>
                    </li>
                    <li className={styles.ulActionsLi} >
                        <button className={classes(styles.button, stylesG.centered)}>Contact
                            Us
                        </button>
                    </li>
                    <li className={styles.ulActionsLi}>
                        <span className={stylesG.centered} style={{display:"none"}}>
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