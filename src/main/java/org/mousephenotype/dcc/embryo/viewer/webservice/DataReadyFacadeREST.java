/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.codehaus.jettison.json.JSONException;
import org.mousephenotype.dcc.embryo.viewer.entities.Centre;
import org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed;


/**
 *
 * @author neil
 */
@Stateless
@Path("ready")
public class DataReadyFacadeREST extends AbstractFacade<Preprocessed> {
    
    
    private final String IEVURL = "https://dev.mousephenotype.org/embryoviewer?mgi=";
    private HashMap<Integer, String> centreMapping;

    public DataReadyFacadeREST() {
        super(Preprocessed.class);
        
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String all() throws JSONException{
        
        getCentreIdMapping();
    
        //VolumesPack vp = new VolumesPack();
        EntityManager em = getEntityManager();
        TypedQuery<Preprocessed> q = em.createNamedQuery("Preprocessed.findByStatusReady", Preprocessed.class);
       
        List<Preprocessed> results = q.getResultList();

        em.close();
       
      
        HashMap<String, ReadyRestMaker> resultHash = new HashMap<>();
        HashMap<String, ArrayList<HashMap<String, Object>>> out = new HashMap<>();
        
        for (Preprocessed p: results){
            if (!resultHash.containsKey(p.getMgi())){
                ReadyRestMaker m = new ReadyRestMaker();
                
                m.setColonyId(p.getColonyId());
                String cenName = centreMapping.get(p.getCid());
                m.setCentreId(cenName);
                m.setMgi(p.getMgi());
                m.addModality(String.valueOf(p.getPid()));
                resultHash.put(p.getMgi(), m);
            }else{
               ReadyRestMaker maker = resultHash.get(p.getMgi());
               maker.addModality(String.valueOf(p.getPid()));
            }
           
        //Build list to output
        ArrayList<HashMap<String, Object>>  resultList = new ArrayList<>();
        for (ReadyRestMaker r : resultHash.values()){
            resultList.add(r.getResults());
        }
        
        


        out.put("colonies", resultList );
            
        }
        //JSONObject jo = new JSONObject();
        Gson gson = new GsonBuilder()
                .disableHtmlEscaping()
                .setPrettyPrinting()
                .create();
          
        String json = gson.toJson(out);
        return json;
    }
    
    
    
    
    private HashMap processResult(Preprocessed p){
        
        HashMap<String, Object> m;
        m = new HashMap<>();
        ArrayList<String> modalities = new ArrayList<>();
        
        String cenName = centreMapping.get(p.getCid());
        m.put("colony_id", p.getColonyId());
        m.put("centre", cenName); //get Centre short name  
        m.put("mgi", p.getMgi());
        m.put("url", IEVURL + p.getMgi());
        modalities.add(String.valueOf(p.getPid()));
        m.put("Modalities", modalities);
        
        
        return m;
    }
    
    
    private void getCentreIdMapping(){
        EntityManager em = getEntityManager();
        TypedQuery<Centre> q = em.createNamedQuery("Centre.getNames", Centre.class);
        List<Centre> results = q.getResultList();
        centreMapping = new HashMap<>();
        for (Centre c: results){
            centreMapping.put(c.getCentreId(), c.getShortName());
        }
        em.close();
        
    }
}
