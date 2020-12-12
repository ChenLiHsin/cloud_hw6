# cloud_hw6
> In this tutorial, we do not show the training samples for each class. This is a little bit inconvinient because users may want to see the samples they collect. What you can do is when user clicks the button, you save the frame that you captured from the camera and display it under the button. This can be done by creating a div block and put canvas elements “inside” it.    

Let me give you some hints:    
1. You need to create three div blocks and place them horizontally.   
2. You should restrict the width of each div blocks and make them scrollable.   
3. Create a canvas element and use getContext('2d') and drawImage() method to draw the frame to canvas element   
4. Append this canvas element to the corresponding div block (use appendChild())   
5. Remember to put a reset button which allows users to start over. (please refer to the knn classifier doc to see how to clear all samples in the classifier)
