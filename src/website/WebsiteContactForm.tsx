import React, {ChangeEvent, EventHandler, useState} from "react";
import styles from "./WebsiteContactForm.module.css";
import stylesG from "./Globals.module.css";
import {classes} from "./Utils";

type FormDataType = {
    name?: string,
    email?: string,
    message?: string,
    file?: File,
}

const WebsiteContactForm = () => {
    const [nameError, setNameError] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<boolean>(false);
    const [data, setData] = useState<FormDataType>({});
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [successfulContact, setSuccessfulContact] = useState<boolean|null>(null);

    const setField = (fieldName: "name" | "email" | "message", fieldData:string) => {
        setData({
            ...data,
            [fieldName]: fieldData
        });
    }

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event?.target?.files
        if(files) {
            setData({
                ...data,
                file: files[0]
            })
        } else {
            console.error("Unable to get file in event:");
            console.error(event);
        }
    };

    const onBlurName = (name:string) =>
        setNameError(!(name && name.length > 0))
    ;

    const onBlurEmail = (email:string) =>
        setEmailError(!(email && /^[^ ]+@[^ ]+\.[^ ]+$/.test(email)))
    ;

    const submit = () => {

        const formData = new FormData();

        if (data.name && data.name.length > 0) {
            formData.append("name", data.name);
        } else {
            setNameError(true);
            return;
        }

        if (data.email && /^[^ ]+@[^ ]+\.[^ ]+$/.test(data.email)) {
            formData.append("email", data.email);
        } else {
            setEmailError(true);
            return;
        }

        if (data.message) {
            formData.append("message", data.message);
        }

        if (data.file) {
            formData.append(
                "myFile",
                data.file,
                data.file.name
            );
        }

        console.log(data);
        setSubmitting(true);

        const requestOptions = {
            method: 'POST',
            headers: {},
            body: formData
        };
        fetch('https://qss6f2ya7wp4lnz47cdf32wutq0rwser.lambda-url.eu-west-1.on.aws', requestOptions)
            .then(response => response.json())
            .then((res) => {
                console.log(res);
                setSubmitting(false);
                setSuccessfulContact(true);
            })
            .catch((e) => {
                console.error(e);
                setSubmitting(false);
                setSuccessfulContact(false);
            })
        ;



    };


    return (
        <div id="contact" className={styles.contactBox} style={{}}>
            {/*<form className="gform"*/}
            {/*      method="POST"*/}
            {/*      data-email="example@email.net"*/}
            {/*      action="https://qss6f2ya7wp4lnz47cdf32wutq0rwser.lambda-url.eu-west-1.on.aws">*/}
                <ul className={styles.ulActions}>
                    <li className={styles.ulActionsLi}>Let's talk about how we can help you!</li>
                    <li className={styles.ulActionsLi}>
                        <input className={styles.ulActionsLiInput}
                               style={{
                                   background: nameError?"pink":"white"
                               }}
                               type="text"
                               name="name"
                               placeholder="Name (required)"
                               onChange={e => setField("name", e.target.value)}
                               onBlur={e => onBlurName(e.target.value)}
                        />
                    </li>
                    <li className={styles.ulActionsLi}>
                        <input className={styles.ulActionsLiInput}
                               style={{
                                   background: emailError?"pink":"white"
                               }}
                               type="text"
                               name="email"
                               placeholder="Email (required)"
                               onChange={e => setField("email", e.target.value)}
                               onBlur={e => onBlurEmail(e.target.value)}
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

                    <li
                        className={styles.ulActionsLi}
                        style={{
                            textAlign: "left"
                        }}
                    >
                        Optionally upload a CSV file to get a demo <br/>(max 10k rows, the column you care about at the end)
                    </li>

                    <li className={styles.ulActionsLi}>
                        <input type="file" onChange={onFileChange}/>
                    </li>

                    <li className={styles.ulActionsLi} >
                        <button
                            className={classes(styles.button, stylesG.centered)}
                            style={{
                                borderColor: "gray",
                                borderWidth: "medium",
                                borderStyle: submitting?"inset":"outset"
                            }}
                            onClick={submit}
                        >
                            Contact Us
                        </button>
                    </li>
                    <li className={styles.ulActionsLi}>
                        {
                            null != successfulContact && successfulContact?
                                <span
                                    className={stylesG.centered}
                                >
                                    <em>Thanks</em> for contacting us<br/>
                                    We will get back to you soon!
                                </span>
                            :
                            null != successfulContact && !successfulContact?
                                <span
                                    className={stylesG.centered}
                                >
                                    There was an error :/<br/>
                                    You can contact us at contact@explicable.ai
                                </span>
                            :
                                ""
                        }
                    </li>
                </ul>
            {/*</form>*/}
        </div>
    );
}
export default WebsiteContactForm;