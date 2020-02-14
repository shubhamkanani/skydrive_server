import { json } from "body-parser";

export const controllers = {
    createOne(model,body){
      return model.create(body);
    },

}