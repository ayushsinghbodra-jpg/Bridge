class ApiError extends Error{
    constructor (
      public status : number ,
      message : string,
      public errors ?: Array<{
        field : string ; message : string
      }>,
    ) {
      super(message);
      this.name= "ApiError";
    }
}

