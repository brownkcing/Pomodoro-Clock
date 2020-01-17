const { useEffect, useState, useContext, createContext, useRef } = React;

const Context = createContext();

const TProvider= props => {
  const [timer, setTimer] = useState ({
        name:'Pomodoro Clock',
        mode:'session',
        session:1500,
        break:300,
        time: {initial:1500, current:1500},
        active: false
  })
  return (
    <Context.Provider value={[timer, setTimer]}>
      {props.children}
      </Context.Provider>
  )
}

function App() {
  return (
      <TProvider>
       <div className="App">
        <Pomodoro />
       </div>
      </TProvider>
  );
}

const Title = (props) => {
    return (
        <header>
            <h1 className="title">{props.title}</h1>
        </header>
    );
}


function Pomodoro (){
  const [timer, setTimer] = useContext(Context)
  const beep = useRef();
  useEffect(() => {
   if (timer.active && timer.time.current > 0){
    const countDown = setInterval(()=>{
      setTimer({
        ...timer,
        time:{initial:timer.time.initial,
              current:timer.time.current - 1}
      })
    }, 1000)
    return function cleanup() {
      clearInterval(countDown);
    };
   } else if (timer.time.current === 0) {
     beep.current.play();
     beep.current.currentTime = 0;
     if (timer.mode === 'session') {
       setTimer({
         ...timer,
         time: {
         current: timer.break,
         initial: timer.break
         },
         mode: 'break',
       });
     } if (timer.mode === 'break') {
        setTimer({
          ...timer,
          time: {
            current: timer.session,
            initial: timer.session
          },
          mode: 'session'
        });
     }
   }
 }, [setTimer, timer]);
  React.useEffect(() => {
    if(timer.playPause){
      beep.current.pause();
      beep.current.currentTime = 0;
     }
  })
   return(
     <div className='pomodoro'>
       <Title title={timer.name} />
      <Timer time={timer.time} mode={timer.mode} />
      <Session 
         durationId={timer.session}
         type='session'
         label={'Session'}
         lengthId={'session-length'}
         labelId={'session-label'}
        />
      <Session
        durationId={timer.break}
        type="break"
        label={'Break'}
        lengthId={"break-length"}
        labelId={"break-label"}
       />
       <PlayPause playing={timer.active} myRef={beep}/>
       <audio
         id="beep"
         preload="auto"
         src="http://newt.phys.unsw.edu.au/music/bellplates/sounds/bellplate-corner4.mp3"
         ref={beep}
        ></audio>
     </div>
   )
}

const Timer = (props) => {
  function clockify (time){
    let minutes = Math.floor(time / 60);
    let seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return minutes + ':' + seconds;
  }
  return (
    <div className='wrapper'>
      <div className='counter'>
        <span className='counterType' id='timer-label'>{props.mode}</span>
        <span id='time-left'>{clockify(props.time.current)}</span>
      </div>
    </div>
  );
}

const Session = (props) => {
  const [timer,setTimer] = useContext(Context)
  const changeDuration = (operators) => {
    let mode = timer.mode;
        if (timer.mode === props.type) {
            if (operators === 'increment' && timer[props.type] < 3600) {
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] + 60,
                    time: {
                        current: timer[timer.mode] + 60,
                        initial: timer[timer.mode] + 60
                    }
                });
            }
            if (operators === 'decrement' && timer[props.type] > 60) {
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] - 60,
                    time: {
                        current: timer[timer.mode] - 60,
                        initial: timer[timer.mode] - 60
                    }
                });
            }
        } else {
            let time = timer.time;
            if (operators === 'increment' && timer[props.type] < 3600 ) {
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] + 60,
                    time: time
                });
            }
            if (operators === 'decrement' && timer[props.type] > 60 ) {
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] - 60,
                    time: time
                });
            }
        }
    };
    return (
      <div className='Session'>
        <Button
                thisClick={() => changeDuration('decrement')}
                className="ctrlBtn"
                buttonId={`${props.type}-decrement`}
            >
                -
            </Button>
            <div className="wrapperDisplay">
                <span id={props.labelId} className="label">
                    {props.label}
                </span>
                <span id={props.lengthId} className="time">
                    {timer[props.type] / 60}
                </span>
            </div>
            <Button
                thisClick={() => changeDuration('increment')}
                className="ctrlBtn"
                buttonId={`${props.type}-increment`}
            >
                +
            </Button>
        </div>
    );
}

const PlayPause = (props) => {
  const[timer,setTimer] = useContext(Context);
  
  const reset = () => {
    setTimer ({
      ...timer,
       mode:'session',
       session:1500,
       break:300,
       time: {initial:1500, current:1500},
       active: false
    })
     props.myRef.current.pause();
     props.myRef.current.currentTime = 0;
  }
  const playPause = () => {
    setTimer({
      ...timer,
      active: !timer.active
    })
  }
  return(
    <div className='PlayPause'>
     <Button buttonId="start_stop" type="play"thisClick={() => playPause()}><i className={`fas ${timer.active ? "fa-pause" : "fa-play"}`}></i></Button>
      <Button buttonId='reset' type='reset' thisClick={() => reset()}><i className="fas fa-redo"></i></Button>
    </div>
  )
}



const Button = (props) => {
    return(
        <button id={props.buttonId} className="Button" onClick={() => props.thisClick(props.type)}>
            {props.children}
        </button>
    )
}


ReactDOM.render(<App />, document.getElementById('root'))