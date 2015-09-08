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

import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import java.io.*;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.zip.*;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

@Stateless
@Path("zip")
public class ZippedFacadeREST {

    public void ZippedFacadeREST() {
    }

    @GET
    @Produces("text/plain")
    public Response all(@QueryParam("vol") String volPaths) {

        List<String> vols = Arrays.asList(volPaths.split(","));

        String outFileName = new SimpleDateFormat("yyyyMMddhhmmss").format(new Date());
        ResponseBuilder response;
        System.out.println(volPaths);
        try {
            File file = File.createTempFile(outFileName, ".zip");
            //BufferedWriter output = new BufferedWriter(new FileWriter(file

            //FileInputStream in = new FileInputStream(inVolPath);
            ZipOutputStream output = new ZipOutputStream(new FileOutputStream(file));

            byte[] buffer = new byte[1024];

            for (String vol : vols) {
                List<String> oldNew = Arrays.asList(vol.split(";"));
                InputStream in;
                in = new URL(oldNew.get(0)).openStream();
                output.putNextEntry(new ZipEntry(oldNew.get(1) + ".nrrd"));

                int count;
                while ((count = in.read(buffer)) > 0) {
                    output.write(buffer, 0, count);
                }
                output.closeEntry();
                in.close();
            }

            output.close();
            response = Response.ok((Object) file);
            response.header("Content-Disposition",
                    "attachment; filename=\"" + outFileName + ".zip" + "\"");
            response.header("Set-Cookie", "fileDownload=true; path=/");
        } catch (IOException ex) {
            //logger.error("Could not ");
            System.out.println(ex);
            response = Response.noContent();
        }
        System.out.println(response);
        return response.build();
    }
}
