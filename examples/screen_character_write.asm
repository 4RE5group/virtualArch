A = 65     # ascii character 65: 'A'
D = A      # copy it to D register
A = 984575 # address for kernel char write operation
*A = D     # this code writes the 'A' character to screen