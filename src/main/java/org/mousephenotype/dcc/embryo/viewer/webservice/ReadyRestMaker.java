/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

import java.util.ArrayList;
import java.util.HashMap;

/**
 *
 * @author neil
 */
public class ReadyRestMaker {
    
    ArrayList<String> procedcureIds;
    ArrayList<String> stages;
    ArrayList<HashMap<String, String>> procsParams;
    String colonyId;
    String centreId;
    String url;
    String mgi;
    final private String IEVURL = "https://dev.mousephenotype.org/embryoviewer?mgi=";

    public ReadyRestMaker(){
        this.procedcureIds = new ArrayList<>();
        this. procsParams = new ArrayList<>();
    }
    
    public void addModality(String procedureId, String parameter) {

        String modalityName = "unknown";
        if ("203".equals(procedureId)) modalityName = "&#956CT E14.5/15.5";
        if ("204".equals(procedureId)) modalityName = "&#956CT E18.5";
        if ("202".equals(procedureId)) modalityName = "OPT 9.5";
        if (!this.procedcureIds.contains(procedureId)){
            this.procedcureIds.add(procedureId);
            HashMap<String, String> pps = new HashMap<>();
            pps.put("procedure_id", procedureId);
            pps.put("parameter_id", parameter);
            pps.put("modality", modalityName);
            this.procsParams.add(pps);
        }
    }
    
    public void setCentreId(String centreId) {
        this.centreId = centreId;
    }

    public void setMgi(String mgi) {
        this.mgi = mgi;
    }
    
    public void setColonyId(String colonyId){
        this.colonyId = colonyId;
    }
    
    public HashMap getResults(){
        HashMap<String, Object> results = new HashMap<>();
        results.put("colony_id", this.colonyId);
        results.put("centre", this.centreId);
        results.put("mgi", this.mgi);
        String url = IEVURL + this.mgi;
        results.put("url", url);
        results.put("procedures_parameters", this.procsParams);
        results.put("stages", this.stages);
        
        return results;
    }
    
}
    

