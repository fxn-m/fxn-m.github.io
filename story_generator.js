// a program to write random 3-part stories in javascript

// each story follows the same general principle
// beginnings set a scene, for which some action will take place
// middles include a description of the action
// endings describe the result of the action

const beginnings = ["The performance opened with a traditional display: ",
                    "Jimmy's first day at school began unexpectedly when after opening his form-room door he saw what appeared to be ",
                    "Emily promptly jumped off the boat after picking up the familiar scent of "] ; 

const middles = ["twelve micro-piglets playing texas hold-em. ",
                 "a brigade of bandits, braiding eachother's hair. ",
                 "Gordon Ramsey's lobster thermidor. "]

const endings = ["What a day!",
                 "No-one was amused.",
                 "Close-by, a boy murmured: 'I like trains'. In the distance, rumbling could be heard."]

let randomIndex = () => Math.floor(Math.random()*3);

let story_generator = document.querySelector('button');
const story_section = document.getElementById('stories');
story_generator.onclick = createStory;


function createStory() {

    const beginning_idx = randomIndex();
    const middle_idx = randomIndex();
    const ending_idx = randomIndex();
    const story = beginnings[beginning_idx] + middles[middle_idx] + endings[ending_idx]

    let storyText = document.createElement('p'); 
    storyText.innerHTML = story
    document.body.append(storyText)

}

