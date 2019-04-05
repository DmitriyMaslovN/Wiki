const thunk = window.ReduxThunk.default; // codepen const
const { applyMiddleware, createStore} = Redux;
const { connect, Provider } = ReactRedux;

const RECEIVED_DATA = 'RECEIVED_DATA';
const IS_LOADING = 'IS_LOADING';
const ERROR = 'ERROR';

const hasError = (bool) =>{
  return{
    type: ERROR,
    isErr: bool
  }
}

const loadingData = (bool) => {
  return{
    type: IS_LOADING,
    isLoading: bool
  }
}
const receivedData = (article) =>{
  return{
    type: RECEIVED_DATA,
    article
  }
}
// Thunk middleware

function fetchData(data){
  //console.log(data)
  return (dispatch) => {
    if(data !== undefined){
      dispatch(loadingData(true)); // loading...
      fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=2&exlimit=max&gsrsearch=${data}`)
      .then(res => res.json())
      .then(result =>{ // chain for dowloading data
        dispatch(loadingData(false))
        const arrObjs = []; 
        let obj = Object.assign({}, result.query.pages);
         for(let item in obj){
            arrObjs.push(obj[item]); // create array to recording each downloading objects  
         } 
         return arrObjs; 
      })
      .then(resArray => dispatch(receivedData(resArray))) // dispatch arrObjs
      .catch(() => dispatch(hasError(true)));
    }
  }
}

const defaultState = {
  isErr: false,
  isLoading: false,
  article: []
}
// one reducer for each state
function reduceData(state = defaultState, action){
  switch(action.type){
    case 'RECEIVED_DATA':
      return {
                isErr: false,
                isLoading: false,
                article: action.article
              }
    case 'IS_LOADING':
      return {
                isErr: false,
                isLoading: action.isLoading,
                article: []
              }
    case 'ERROR':
      return {
                isErr: action.isErr,
                isLoading: false,
                article: []
              }
    default:
      return state;   
  }
}
// create store with middleware 
const store = createStore(
  reduceData,
  applyMiddleware(thunk)
);

class AppWiki extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      input: '',
      search: 'noSearch',
      focus: 'input'
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }
  
  handleChange(e){
    if(e.target.value.length <= 30)
    this.setState({input: e.target.value});
  }
  onFocus(e) {

   this.setState({focus: 'focus'}) 
   if( e.type === "blur" && this.state.input === ''){
      this.setState({focus: 'input'});
    }
  }
  
  handleSubmit(){
    this.props.fetchData(this.state.input); // search data
    if(this.state.input !== ''){
      this.setState({input: '',
                    search: 'search',
                    focus: 'input'
                    })
    }else{
      this.setState({input: '',
                    search: 'noSearch'
                    })
    } 
  }
 

  componentDidMount() {
   this.props.fetchData();
  }
  render(){
    const list = this.props.article.map((item, i)=> { // loop for arr
       if(item.thumbnail){ // if have image
         return (
          <div className="divItem hvr-overline-from-center" key={item.index} > 
           <a href={"https://en.wikipedia.org/?curid=" + item.pageid} >
            <li className="item">
                <div>
                  <h2 className="title">{item.title}</h2>
                  <img className="imgWiki"
                       src={item.thumbnail.source} 
                       alt={item.pageimage}/>
                  <p className="text">{item.extract}</p>
                </div> 
            </li>
           </a>
          </div>
          )
       } else{
         return (
           <div className="divItem hvr-outline-in" key={item.index}>
            <a href={"https://en.wikipedia.org/?curid=" + item.pageid} >
              <li className="item">
               <div>
                  <h2 className="title">{item.title}</h2>
                  <p className="text">{item.extract}</p> 
                </div>
              </li>
           </a>
          </div>
          )
       }
    })
    
    if (this.props.hasError) {
      return <div>Error dowloading data</div>;
    } else if (this.props.isLoading) {
      return <div className="loading">Loading...</div>;
    } else {
        return(
        <React.Fragment>
            <div className={this.state.search}>
              <input className={this.state.focus}
                     type="text" 
                     onFocus={this.onFocus}
                     onBlur={this.onFocus}
                     onChange={this.handleChange} 
                     value={this.state.input}/>  
              
              <input className="submit"
                     type="submit" 
                     value="Search" 
                     onClick={this.handleSubmit}/> 
            </div>
            <div>
              {list}
            </div>
        </React.Fragment>
      )
    }
  }
}
// state from actions
const mapStateToProps = (state) => {
  return {
    isErr: state.isErr,
    isLoading: state.isLoading,
    article: state.article
  }
}
// send creator actions

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (data) => dispatch(fetchData(data))
  }
}
// connect state, dispatch an component
const Container = connect(mapStateToProps, 
                          mapDispatchToProps)(AppWiki);

ReactDOM.render(<Provider store={store}>
                  <Container />
                </Provider>, document.getElementById("root"));
