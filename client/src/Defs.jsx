export const board_list=['p','cp', 'n', 's','v', 'k', 'a','c', 'T', 'Sp', 'Ph', 'm', 'G','r', 'd', 'Con', 'GIF', 'Rnt','pol'];

export const links=['Programming', 'Competitive Programming', 'Nerd', 'Semester','Video Games', 'Khelkud', 'Arambh','Comics & Cartoons', 'Technology', 'Sports','Photography', 'Music', 'Graphic Design','Randi', 'Dick', 'Confess', 'GIF', 'Rant','politics']

export const URL = "http://localhost:3000"

export const fetchThreads=async()=>{
    const response = await fetch(`${URL}/thread/${id}`);
    const data = await response.json();
    console.log(data);
    setThreadData(data);
}
