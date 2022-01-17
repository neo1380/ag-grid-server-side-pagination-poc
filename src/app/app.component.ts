import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import "ag-grid-enterprise";
import { GridOptions, IDatasource, IGetRowsParams, GridApi } from 'ag-grid-community';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const newRow:any = {
    "name": "test ",
    "trips": 250
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public gridApi:any;
    public gridColumnApi:any;  
    public columnDefs;
    public defaultColDef;
    public rowSelection;
    public rowModelType;
    public rowData = [];
    public rowDataServerSide = []
    public serverSidePrototype =function(){};
    public serverSideDatasource = {};
    public self = this;
    public addRowInProgress = false;
    public totalPages:any;
    
    constructor(private http: HttpClient) {
     
      this.defaultColDef = {
        width: 100,
        resizable: true
      };
      this.rowSelection = "single";
      this.rowModelType = "serverSide";
      this.columnDefs = [
        {
          field: "name",
          width: 150
        },
        { field: "trips" }
      ];    

    //   this.serverSidePrototype.prototype.getRows = function(params:any) {
    //     var rowsThisPage = this.rowDataServerSide.slice(params.startRow, params.endRow);
    //     params.successCallback(rowsThisPage, this.rowDataServerSide.length);
    //   };
    }

    createMyDataSource(data:any = null) {
        if(!data) return;
        this.rowDataServerSide = data;
        const self = this;
        function MyDatasource() {}
        MyDatasource.prototype.getRows = function(params:any) {
            const startRow:any = params.request.startRow;
            console.log('from my custom data source');
            self.http.get(`https://api.instantwebtools.net/v1/passenger?page=${params.request.startRow}&size=10`).subscribe((response:any) => {
                    var data = response.data;           
                    self.rowDataServerSide = data;
                    console.log(data)
                    params.successCallback(
                    data, response.totalPages
                );
            });
        };
        return new (MyDatasource as any)();
      }
  
    onBtRemove() {
      var selectedRows = this.gridApi.getSelectedNodes();
      if (!selectedRows || selectedRows.length === 0) {
        return;
      }
      var selectedRow = selectedRows[0];
      this.rowDataServerSide.splice(selectedRow.rowIndex, 0);

    //   this.gridApi.purgeServerSideCache();
    }
  
    onBtAdd() {
      var selectedRows = this.gridApi.getSelectedNodes();
      if (!selectedRows || selectedRows.length === 0) {
        return;
      }    
      var selectedRow = selectedRows[0];
      this.addRowInProgress = true;
      this.rowDataServerSide.splice(selectedRow.rowIndex, 0, newRow as never); 
      this.gridApi.purgeServerSideCache();
    }
  
    onGridReady(params:any) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      this.gridApi.setServerSideDatasource(this.dataSource);
    //    var source = this.createMyDataSource() 
    //   this.gridApi.setServerSideDatasource(source);
    }
  
   dataSource: IDatasource = {
      getRows: (params: any) => {
  
        // Use startRow and endRow for sending pagination to Backend
        // params.startRow : Start Page
        // params.endRow : End Page
  
        //replace this.apiService with your Backend Call that returns an Observable
        console.log(params)      
        if(!this.addRowInProgress){
            const startRow:any = params.request.startRow;
            this.http.get(`https://api.instantwebtools.net/v1/passenger?page=${params.request.startRow}&size=10`).subscribe((response:any) => {
                var data = response.data;           
                this.rowDataServerSide = data;
                this.totalPages = response.totalPages;
                console.log(data)
                params.successCallback(
                data, this.totalPages
              );
            })
        }else{
            params.successCallback(
                this.rowDataServerSide, this.totalPages
              );
            this.addRowInProgress = false;  
        }
      }
    }
  }
  
  

