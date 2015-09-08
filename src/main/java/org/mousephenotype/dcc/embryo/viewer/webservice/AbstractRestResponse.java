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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public abstract class AbstractRestResponse<T> {

    private boolean success = false;
    private String test = "not work";
    private long total = 0L; /* if negative, absolute value gives error code */
    private HashMap<Integer, List<T>> dataSet = null;

    public AbstractRestResponse() {
    }

    public  HashMap<Integer, List<T>> getDataSet() {
        return dataSet;
    }

    public void setDataSet(HashMap<Integer, List<T>> dataSet) {
        this.dataSet = dataSet;
        if (dataSet == null || dataSet.isEmpty()) {
            this.success = false;
            this.dataSet = new  HashMap<>();
        } else {
            this.success = true;
            this.total = dataSet.size();
        }
    }

    public void setDataSet( HashMap<Integer, List<T>> dataSet, long total) {
        this.dataSet = dataSet;
        if (dataSet == null || dataSet.isEmpty()) {
            this.success = false;
            this.dataSet = new HashMap<>();
        } else {
            this.test = "testingSuccess";
            this.success = true;
            this.total = total;
        }
    }

    public boolean getSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public void sessionHasExpired() {
        this.success = false;
        this.total = -401;
    }
    
   
}
