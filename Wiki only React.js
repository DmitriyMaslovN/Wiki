class AppWiki extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      input: '',
      article: []
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e){
    this.setState({input: e.target.value})
  }
  handleSubmit(){
    const dataInput = this.state.input;
    this.setState({input: ''});
    this.fetchData(dataInput); // update downloading data
  }
  
  fetchData(data){

    if(data !== undefined){
       this.setState({ isLoaded: true }); // loading...
       fetch(`https://en.wikipedia.org/w/api.php?format=json&action=query&origin=*&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=2&exlimit=max&gsrsearch=${data}`)
      .then(res => res.json())
      .then(result =>{ // chain for dowloading data
        const arrObjs = []; 
        let obj = Object.assign({}, result.query.pages);
         for(let item in obj){
            arrObjs.push(obj[item]); // create array to recording each downloading objects  
         } 
         return arrObjs;
      })
      .then(resArray => this.setState({article: resArray,
                                       isLoaded: false})); // chain to record all objects 
    }
  }
  
  componentDidMount() {
    try{
     this.fetchData();
    }catch(error){
      console.log("Error: " + error);
    } 
  }
  render(){
    const { article, isLoaded, error, input } = this.state;
  
    const list = article.map((item)=> { // loop for arr
       if(item.thumbnail){ // if have image
         return (
          <div key={item.index}>
            <a href={"https://en.wikipedia.org/?curid=" + item.pageid} >
            <h2>{item.title}</h2>
            <img src={item.thumbnail.source} 
                 alt={item.pageimage}/>
            <p>{item.extract}</p>
             </a>
          </div>
          )
       } else{
         return (
          <div key={item.index}>
            <a href={"https://en.wikipedia.org/?curid=" + item.pageid} >
            <h2>{item.title}</h2>
            <p>{item.extract}</p>
             </a>
          </div>
          )
       }
    })
   
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (isLoaded) {
      return <div className="loading">Loading...</div>;
    } else {
        return(
        <div>
          <input type="text" 
                 onChange={this.handleChange} 
                 value={input}/>
          <input type="submit" 
                 value="Submit" 
                 onClick={this.handleSubmit}/>
            
            <div>
              {list}
            </div>
        </div>
      )
    }
  }
}

ReactDOM.render(<AppWiki />, document.getElementById("root"));
