/*
 * Copyright 2015 Medical Research Council Harwell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

/**
 *
 * @author neil
 */
public class Utils {
    
      public Utils(){
          
      }
      
      public static String buildUrl(String cid, String lid, String sid, 
              String pid, String qid, String imageName){
        
        String image_server = "https://www.mousephenotype.org/images/emb/";
          
        String url = 
        image_server + '/' +
        cid + '/' +
        lid + '/' +
        sid + '/' +
        pid + '/' +
        qid + '/' +
        imageName;
       
        return url;
    }
    
}
