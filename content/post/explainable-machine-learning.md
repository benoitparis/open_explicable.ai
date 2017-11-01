+++
Description = ""
date = "2017-11-01T12:28:54+01:00"
menu = "main"
title = "Explainable machine learning"

+++

While achieving great predictive power, machine learning models can be really opaque for their users; be it a data science team, a marketing executive, a salesperson, or the end user. For example in classification we are often left with a probability distribution, and absolutely no intuition of the relations inside the dataset at hand.

[DARPA](https://www.darpa.mil/) has recently launched a program aimed just at that: [Explainable Artificial Intelligence (XAI)](https://www.darpa.mil/program/explainable-artificial-intelligence). We believe this will be an indispensible part of Machine Learning in the future, and has great potential in being applied to marketing data. 

The aim of this project is to build support around explorations of these model parameters, to provide humans an understanding of decisions taken.

Some models do provide feature importances; but these are global indicators and only provide cursory understanding of the dataset. An explainable model should provide indicators for each entity, and insightful visualizations of these indicators as well. These indicators should also be queryable for analysis, and aggregatable in high level visualizations. For example in a marketing dataset, user segmentation -as defined by the data- should emerge naturally in such a visualization. 

Using this approach should yield the following benefits:

* Better debugability: Data scientists can know exactly and precisely how having one feature at a specific value for one entity is affecting the probability distribution of its classes. If a dataset suffers from time pollution, it should be immediately obvious; even if few entities are affected.

* Data-driven understanding of a dataset: Organizations often make a lot of assumptions as to how their users behave, and how each information is supposedly indicative of their users' behavior. With the benefit of an explanation of a model, a marketing executive should be able gain precise and detailed insights that are data-supported; and be able to deliver different messages for the different ways their users value their service, in an automated fashion.

* Fine-grained message tuning: Based on profile data, salespersons should be able to know what the customer is bound to value when presented a product, or what are the buying patterns.

* Ethical: Recipients of a marketing campaign could also benefit in knowing why they were part of a promotion, and how each part of their profile influenced the decision.

---

An example of an explained prediction, with the explanation in colored cells:

![example UI](/img/example-UI.png)

This example displays different clients who buy for different reasons. A classic Machine Learning pipeline would only result in the probabilities -which would be the same-; but in this case an executive can know why products are being bought, and a salesperson would be able to tune a message to close the sale. Notice there is one French butter buyer, and that the display shows this is why he is buying (the example is set in the great butter crisis of 2017). Global feature importance for "Region" and "Most bought category" would show little importance, and this niche market would go undetected.




